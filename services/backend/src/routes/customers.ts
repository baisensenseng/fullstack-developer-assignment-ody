import { createRoute, z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import { createDb } from '../db/client';
import { customers } from '../db/schema';
import type { AppEnv } from '../env';
import { getUserFromToken } from '../services/auth-service';
import { createCustomer, getCustomerById, listCustomers, updateCustomer } from '../services/customer-service';
import { fulfillmentTypes, orderStatuses } from '../services/order-service';
import type { OpenAPIHono } from '@hono/zod-openapi';

const customerSelectSchema = createSelectSchema(customers);
const customerIdParamSchema = z.object({ customerId: customerSelectSchema.shape.id });
const orderStatusSchema = z.enum(orderStatuses);
const fulfillmentTypeSchema = z.enum(fulfillmentTypes);

const errorResponseSchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) });
const customerBaseSchema = z.object({
  id: customerSelectSchema.shape.id,
  name: customerSelectSchema.shape.name,
  email: customerSelectSchema.shape.email,
  phone: customerSelectSchema.shape.phone,
  notes: customerSelectSchema.shape.notes,
  tags: customerSelectSchema.shape.tags,
  createdAt: z.string(),
  updatedAt: z.string()
});
const customerSummarySchema = customerBaseSchema.extend({
  orderCount: z.number().int().min(0),
  totalSpendCents: z.number().int().min(0),
  lastOrderAt: z.string().nullable()
});
const customerDetailSchema = customerSummarySchema.extend({ averageOrderValueCents: z.number().int().min(0) });
const customerOrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  status: orderStatusSchema,
  fulfillmentType: fulfillmentTypeSchema,
  itemCount: z.number().int().min(0),
  totalCents: z.number().int().min(0),
  createdAt: z.string(),
  updatedAt: z.string()
});
const customerBodySchema = z.object({
  name: customerSelectSchema.shape.name.min(1).max(160),
  email: customerSelectSchema.shape.email.email().max(255),
  phone: customerSelectSchema.shape.phone.min(1).max(40),
  notes: customerSelectSchema.shape.notes.max(1000),
  tags: customerSelectSchema.shape.tags.max(255)
});
const updateCustomerBodySchema = customerBodySchema.partial().refine((value) => Object.keys(value).length > 0, { message: 'Provide at least one field.' });

const listCustomersRoute = createRoute({
  method: 'get',
  path: '/customers',
  operationId: 'listCustomers',
  request: { query: z.object({ search: z.string().optional() }) },
  responses: {
    200: { description: 'Customer CRM list', content: { 'application/json': { schema: z.object({ customers: z.array(customerSummarySchema), summary: z.object({ totalCustomers: z.number().int().min(0), activeCustomers: z.number().int().min(0), totalSpendCents: z.number().int().min(0), averageSpendCents: z.number().int().min(0), totalOrders: z.number().int().min(0) }) }) } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } }
  }
});
const getCustomerByIdRoute = createRoute({
  method: 'get',
  path: '/customers/{customerId}',
  operationId: 'getCustomerById',
  request: { params: customerIdParamSchema },
  responses: {
    200: { description: 'Customer CRM detail', content: { 'application/json': { schema: z.object({ customer: customerDetailSchema, orders: z.array(customerOrderSchema) }) } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Customer not found', content: { 'application/json': { schema: errorResponseSchema } } }
  }
});
const createCustomerRoute = createRoute({
  method: 'post',
  path: '/customers',
  operationId: 'createCustomer',
  request: { body: { content: { 'application/json': { schema: customerBodySchema } } } },
  responses: {
    201: { description: 'Created customer', content: { 'application/json': { schema: z.object({ customer: customerDetailSchema }) } } },
    400: { description: 'Invalid customer payload', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    409: { description: 'Customer email already exists', content: { 'application/json': { schema: errorResponseSchema } } }
  }
});
const updateCustomerRoute = createRoute({
  method: 'patch',
  path: '/customers/{customerId}',
  operationId: 'updateCustomer',
  request: { params: customerIdParamSchema, body: { content: { 'application/json': { schema: updateCustomerBodySchema } } } },
  responses: {
    200: { description: 'Updated customer', content: { 'application/json': { schema: z.object({ customer: customerDetailSchema }) } } },
    400: { description: 'Invalid customer payload', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Customer not found', content: { 'application/json': { schema: errorResponseSchema } } },
    409: { description: 'Customer email already exists', content: { 'application/json': { schema: errorResponseSchema } } }
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
 * Description: Implements getCustomerErrorMessage.
 * Parameters: error unknown thrown service error.
 * Returns: string normalized customer error code.
 */
function getCustomerErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'CUSTOMER_ERROR';
}

/**
 * Description: Implements registerCustomerRoutes.
 * Parameters: app OpenAPIHono application instance.
 * Returns: void after route registration.
 */
export function registerCustomerRoutes(app: OpenAPIHono<AppEnv>) {
  app.openapi(listCustomersRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);
    return c.json(await listCustomers(createDb(c.env.DATABASE_URL), c.req.valid('query')), 200 as const);
  });
  app.openapi(getCustomerByIdRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);
    const { customerId } = c.req.valid('param');
    const customer = await getCustomerById(createDb(c.env.DATABASE_URL), customerId);
    if (!customer) return c.json({ error: { code: 'CUSTOMER_NOT_FOUND', message: 'Customer was not found.' } }, 404);
    return c.json(customer, 200 as const);
  });
  app.openapi(createCustomerRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);
    try {
      return c.json({ customer: await createCustomer(createDb(c.env.DATABASE_URL), c.req.valid('json')) }, 201);
    } catch (error) {
      const message = getCustomerErrorMessage(error);
      if (message === 'CUSTOMER_EMAIL_EXISTS') return c.json({ error: { code: message, message: 'A customer with this email already exists.' } }, 409);
      if (message === 'CUSTOMER_NAME_REQUIRED') return c.json({ error: { code: message, message: 'Customer name is required.' } }, 400);
      if (message === 'CUSTOMER_EMAIL_REQUIRED') return c.json({ error: { code: message, message: 'Customer email is required.' } }, 400);
      if (message === 'CUSTOMER_PHONE_REQUIRED') return c.json({ error: { code: message, message: 'Customer phone is required.' } }, 400);
      if (message === 'CUSTOMER_CREATE_FAILED') return c.json({ error: { code: message, message: 'Customer could not be created.' } }, 400);
      throw error;
    }
  });
  app.openapi(updateCustomerRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);
    try {
      const { customerId } = c.req.valid('param');
      return c.json({ customer: await updateCustomer(createDb(c.env.DATABASE_URL), customerId, c.req.valid('json')) }, 200 as const);
    } catch (error) {
      const message = getCustomerErrorMessage(error);
      if (message === 'CUSTOMER_NOT_FOUND') return c.json({ error: { code: message, message: 'Customer was not found.' } }, 404);
      if (message === 'CUSTOMER_EMAIL_EXISTS') return c.json({ error: { code: message, message: 'A customer with this email already exists.' } }, 409);
      if (message === 'CUSTOMER_NAME_REQUIRED') return c.json({ error: { code: message, message: 'Customer name is required.' } }, 400);
      if (message === 'CUSTOMER_EMAIL_REQUIRED') return c.json({ error: { code: message, message: 'Customer email is required.' } }, 400);
      if (message === 'CUSTOMER_PHONE_REQUIRED') return c.json({ error: { code: message, message: 'Customer phone is required.' } }, 400);
      if (message === 'CUSTOMER_UPDATE_FAILED') return c.json({ error: { code: message, message: 'Customer could not be updated.' } }, 400);
      throw error;
    }
  });
}
