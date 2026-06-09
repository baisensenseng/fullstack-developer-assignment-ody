import { createRoute, z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import { createDb } from '../db/client';
import { menuCategories, menuItems } from '../db/schema';
import type { AppEnv } from '../env';
import { getUserFromToken } from '../services/auth-service';
import { createMenuCategory, createMenuItem, listMenu, menuAvailabilityFilters, updateMenuCategory, updateMenuItem } from '../services/menu-service';
import type { OpenAPIHono } from '@hono/zod-openapi';

const menuItemSelectSchema = createSelectSchema(menuItems);
const menuCategorySelectSchema = createSelectSchema(menuCategories);
const menuAvailabilitySchema = z.enum(menuAvailabilityFilters);
const menuItemIdParamSchema = z.object({ itemId: menuItemSelectSchema.shape.id });
const menuCategoryIdParamSchema = z.object({ categoryId: menuCategorySelectSchema.shape.id });

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string()
  })
});

const menuCategorySchema = z.object({
  id: menuCategorySelectSchema.shape.id,
  name: menuCategorySelectSchema.shape.name,
  sortOrder: menuCategorySelectSchema.shape.sortOrder,
  itemCount: z.number().int().min(0),
  createdAt: z.string()
});

const menuItemSchema = z.object({
  id: menuItemSelectSchema.shape.id,
  categoryId: menuCategorySelectSchema.shape.id,
  categoryName: z.string(),
  name: menuItemSelectSchema.shape.name,
  priceCents: menuItemSelectSchema.shape.priceCents,
  description: menuItemSelectSchema.shape.description,
  sku: menuItemSelectSchema.shape.sku,
  prepStation: menuItemSelectSchema.shape.prepStation,
  dietaryTags: menuItemSelectSchema.shape.dietaryTags,
  isAvailable: menuItemSelectSchema.shape.isAvailable,
  isArchived: menuItemSelectSchema.shape.isArchived,
  createdAt: z.string()
});

const menuResponseSchema = z.object({
  categories: z.array(menuCategorySchema),
  items: z.array(menuItemSchema),
  summary: z.object({
    totalItems: z.number().int().min(0),
    availableItems: z.number().int().min(0),
    unavailableItems: z.number().int().min(0),
    archivedItems: z.number().int().min(0),
    categoryCount: z.number().int().min(0)
  })
});

const menuCategoryBodySchema = z.object({
  name: menuCategorySelectSchema.shape.name.min(1).max(120),
  sortOrder: z.number().int().min(0)
});

const updateMenuCategoryBodySchema = menuCategoryBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'Provide at least one field.'
});

const menuItemBodySchema = z.object({
  categoryId: menuCategorySelectSchema.shape.id,
  name: menuItemSelectSchema.shape.name.min(1).max(160),
  priceCents: z.number().int().min(1),
  description: menuItemSelectSchema.shape.description.max(500),
  sku: menuItemSelectSchema.shape.sku.max(80),
  prepStation: menuItemSelectSchema.shape.prepStation.min(1).max(80),
  dietaryTags: menuItemSelectSchema.shape.dietaryTags.max(255),
  isAvailable: z.boolean()
});

const updateMenuItemBodySchema = menuItemBodySchema.extend({ isArchived: z.boolean() }).partial().refine((value) => Object.keys(value).length > 0, {
  message: 'Provide at least one field.'
});

const listMenuRoute = createRoute({
  method: 'get',
  path: '/menu',
  operationId: 'listMenu',
  request: {
    query: z.object({
      search: z.string().optional(),
      categoryId: menuCategorySelectSchema.shape.id.optional(),
      availability: menuAvailabilitySchema.optional()
    })
  },
  responses: {
    200: {
      description: 'Menu management data',
      content: { 'application/json': { schema: menuResponseSchema } }
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

const createMenuCategoryRoute = createRoute({
  method: 'post',
  path: '/menu/categories',
  operationId: 'createMenuCategory',
  request: { body: { content: { 'application/json': { schema: menuCategoryBodySchema } } } },
  responses: {
    201: {
      description: 'Created menu category',
      content: { 'application/json': { schema: z.object({ category: menuCategorySchema }) } }
    },
    400: {
      description: 'Invalid menu category payload',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    404: {
      description: 'Referenced menu category not found',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

const updateMenuCategoryRoute = createRoute({
  method: 'patch',
  path: '/menu/categories/{categoryId}',
  operationId: 'updateMenuCategory',
  request: {
    params: menuCategoryIdParamSchema,
    body: { content: { 'application/json': { schema: updateMenuCategoryBodySchema } } }
  },
  responses: {
    200: {
      description: 'Updated menu category',
      content: { 'application/json': { schema: z.object({ category: menuCategorySchema }) } }
    },
    400: {
      description: 'Invalid menu category payload',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    404: {
      description: 'Menu category not found',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

const createMenuItemRoute = createRoute({
  method: 'post',
  path: '/menu/items',
  operationId: 'createMenuItem',
  request: { body: { content: { 'application/json': { schema: menuItemBodySchema } } } },
  responses: {
    201: {
      description: 'Created menu item',
      content: { 'application/json': { schema: z.object({ item: menuItemSchema }) } }
    },
    400: {
      description: 'Invalid menu item payload',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    404: {
      description: 'Referenced menu resource not found',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

const updateMenuItemRoute = createRoute({
  method: 'patch',
  path: '/menu/items/{itemId}',
  operationId: 'updateMenuItem',
  request: {
    params: menuItemIdParamSchema,
    body: { content: { 'application/json': { schema: updateMenuItemBodySchema } } }
  },
  responses: {
    200: {
      description: 'Updated menu item',
      content: { 'application/json': { schema: z.object({ item: menuItemSchema }) } }
    },
    400: {
      description: 'Invalid menu item payload',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    404: {
      description: 'Menu item not found',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
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
 * Description: Implements toMenuError.
 * Parameters: error unknown thrown service error.
 * Returns: typed API error response metadata.
 */
function toMenuError(error: unknown) {
  const message = error instanceof Error ? error.message : 'MENU_ERROR';

  if (message === 'MENU_ITEM_NOT_FOUND') return { status: 404 as const, body: { error: { code: message, message: 'Menu item was not found.' } } };
  if (message === 'MENU_CATEGORY_NOT_FOUND') return { status: 404 as const, body: { error: { code: message, message: 'Menu category was not found.' } } };
  if (message === 'MENU_CATEGORY_NAME_EXISTS') return { status: 400 as const, body: { error: { code: message, message: 'A menu category with this name already exists.' } } };
  if (message === 'MENU_CATEGORY_NAME_REQUIRED') return { status: 400 as const, body: { error: { code: message, message: 'Menu category name is required.' } } };
  if (message === 'INVALID_MENU_CATEGORY_SORT_ORDER') return { status: 400 as const, body: { error: { code: message, message: 'Menu category sort order must be zero or greater.' } } };
  if (message === 'MENU_CATEGORY_CREATE_FAILED') return { status: 400 as const, body: { error: { code: message, message: 'Menu category could not be created.' } } };
  if (message === 'MENU_CATEGORY_UPDATE_FAILED') return { status: 400 as const, body: { error: { code: message, message: 'Menu category could not be updated.' } } };
  if (message === 'MENU_ITEM_NAME_EXISTS') return { status: 400 as const, body: { error: { code: message, message: 'A menu item with this name already exists.' } } };
  if (message === 'MENU_ITEM_NAME_REQUIRED') return { status: 400 as const, body: { error: { code: message, message: 'Menu item name is required.' } } };
  if (message === 'INVALID_MENU_ITEM_PRICE') return { status: 400 as const, body: { error: { code: message, message: 'Menu item price must be greater than zero.' } } };
  if (message === 'MENU_ITEM_CREATE_FAILED') return { status: 400 as const, body: { error: { code: message, message: 'Menu item could not be created.' } } };
  if (message === 'MENU_ITEM_UPDATE_FAILED') return { status: 400 as const, body: { error: { code: message, message: 'Menu item could not be updated.' } } };

  throw error;
}

/**
 * Description: Implements registerMenuRoutes.
 * Parameters: app OpenAPIHono application instance.
 * Returns: void after route registration.
 */
export function registerMenuRoutes(app: OpenAPIHono<AppEnv>) {
  app.openapi(listMenuRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);

    return c.json(await listMenu(createDb(c.env.DATABASE_URL), c.req.valid('query')), 200 as const);
  });

  app.openapi(createMenuCategoryRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);

    try {
      return c.json({ category: await createMenuCategory(createDb(c.env.DATABASE_URL), c.req.valid('json')) }, 201);
    } catch (error) {
      const menuError = toMenuError(error);
      return c.json(menuError.body, menuError.status);
    }
  });

  app.openapi(updateMenuCategoryRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);

    try {
      const { categoryId } = c.req.valid('param');
      return c.json({ category: await updateMenuCategory(createDb(c.env.DATABASE_URL), categoryId, c.req.valid('json')) }, 200 as const);
    } catch (error) {
      const menuError = toMenuError(error);
      return c.json(menuError.body, menuError.status);
    }
  });

  app.openapi(createMenuItemRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);

    try {
      return c.json({ item: await createMenuItem(createDb(c.env.DATABASE_URL), c.req.valid('json')) }, 201);
    } catch (error) {
      const menuError = toMenuError(error);
      return c.json(menuError.body, menuError.status);
    }
  });

  app.openapi(updateMenuItemRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);

    try {
      const { itemId } = c.req.valid('param');
      return c.json({ item: await updateMenuItem(createDb(c.env.DATABASE_URL), itemId, c.req.valid('json')) }, 200 as const);
    } catch (error) {
      const menuError = toMenuError(error);
      return c.json(menuError.body, menuError.status);
    }
  });
}
