import { createRoute, z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import { createDb } from '../db/client';
import { orderingSettings } from '../db/schema';
import type { AppEnv } from '../env';
import { getUserFromToken } from '../services/auth-service';
import { getSettings, updateSettings } from '../services/settings-service';
import type { OpenAPIHono } from '@hono/zod-openapi';

const settingsSelectSchema = createSelectSchema(orderingSettings);
const errorResponseSchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) });
const settingsSchema = z.object({
  id: settingsSelectSchema.shape.id,
  serviceAvailable: settingsSelectSchema.shape.serviceAvailable,
  autoAccept: settingsSelectSchema.shape.autoAccept,
  prepTimeMinutes: settingsSelectSchema.shape.prepTimeMinutes,
  businessName: settingsSelectSchema.shape.businessName,
  timezone: settingsSelectSchema.shape.timezone,
  currency: settingsSelectSchema.shape.currency,
  openingHours: settingsSelectSchema.shape.openingHours,
  newOrderAlerts: settingsSelectSchema.shape.newOrderAlerts,
  lowStockAlerts: settingsSelectSchema.shape.lowStockAlerts,
  dailyDigest: settingsSelectSchema.shape.dailyDigest,
  updatedAt: z.string()
});
const updateSettingsBodySchema = z.object({
  serviceAvailable: settingsSelectSchema.shape.serviceAvailable.optional(),
  autoAccept: settingsSelectSchema.shape.autoAccept.optional(),
  prepTimeMinutes: z.number().int().min(5).max(180).optional(),
  businessName: settingsSelectSchema.shape.businessName.min(1).max(160).optional(),
  timezone: settingsSelectSchema.shape.timezone.min(1).max(80).optional(),
  currency: settingsSelectSchema.shape.currency.min(3).max(3).optional(),
  openingHours: settingsSelectSchema.shape.openingHours.min(1).max(255).optional(),
  newOrderAlerts: settingsSelectSchema.shape.newOrderAlerts.optional(),
  lowStockAlerts: settingsSelectSchema.shape.lowStockAlerts.optional(),
  dailyDigest: settingsSelectSchema.shape.dailyDigest.optional()
}).refine((value) => Object.keys(value).length > 0, { message: 'Provide at least one field.' });

const getSettingsRoute = createRoute({
  method: 'get',
  path: '/settings',
  operationId: 'getSettings',
  responses: {
    200: { description: 'Restaurant settings', content: { 'application/json': { schema: z.object({ settings: settingsSchema }) } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } }
  }
});

const updateSettingsRoute = createRoute({
  method: 'patch',
  path: '/settings',
  operationId: 'updateSettings',
  request: { body: { content: { 'application/json': { schema: updateSettingsBodySchema } } } },
  responses: {
    200: { description: 'Updated restaurant settings', content: { 'application/json': { schema: z.object({ settings: settingsSchema }) } } },
    400: { description: 'Invalid settings payload', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } }
  }
});

/**
 * Description: Implements isAuthorized.
 * Parameters: authorization string optional authorization header, databaseUrl string database URL, authSecret string JWT secret.
 * Returns: Promise<boolean> indicating whether the request is authenticated.
 */
async function isAuthorized(authorization: string | undefined, databaseUrl: string, authSecret: string) {
  const token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : '';
  if (!token) return false;
  const db = createDb(databaseUrl);
  const user = await getUserFromToken(db, token, authSecret);
  return Boolean(user);
}

/**
 * Description: Implements getSettingsErrorMessage.
 * Parameters: error unknown thrown service error.
 * Returns: string normalized settings error code.
 */
function getSettingsErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'SETTINGS_ERROR';
}

/**
 * Description: Implements registerSettingsRoutes.
 * Parameters: app OpenAPIHono application instance.
 * Returns: void after route registration.
 */
export function registerSettingsRoutes(app: OpenAPIHono<AppEnv>) {
  app.openapi(getSettingsRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);
    return c.json({ settings: await getSettings(createDb(c.env.DATABASE_URL)) }, 200 as const);
  });

  app.openapi(updateSettingsRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);
    try {
      return c.json({ settings: await updateSettings(createDb(c.env.DATABASE_URL), c.req.valid('json')) }, 200 as const);
    } catch (error) {
      const message = getSettingsErrorMessage(error);
      if (message === 'INVALID_PREP_TIME') return c.json({ error: { code: message, message: 'Prep time must be between 5 and 180 minutes.' } }, 400);
      if (message === 'SETTINGS_CREATE_FAILED') return c.json({ error: { code: message, message: 'Settings could not be created.' } }, 400);
      if (message === 'SETTINGS_UPDATE_FAILED') return c.json({ error: { code: message, message: 'Settings could not be updated.' } }, 400);
      throw error;
    }
  });
}
