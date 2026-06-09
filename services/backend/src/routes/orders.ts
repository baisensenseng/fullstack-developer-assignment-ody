import { createRoute, z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import { createDb } from '../db/client';
import { customers, menuItems, orders } from '../db/schema';
import type { AppEnv } from '../env';
import { getUserFromToken } from '../services/auth-service';
import { createOrder, fulfillmentTypes, getOrderById, listOrderCreateOptions, listOrders, orderActions, orderStatuses, performOrderAction } from '../services/order-service';
import type { OpenAPIHono } from '@hono/zod-openapi';

const orderSelectSchema = createSelectSchema(orders);
const customerSelectSchema = createSelectSchema(customers);
const menuItemSelectSchema = createSelectSchema(menuItems);
const orderIdParamSchema = z.object({ orderId: orderSelectSchema.shape.id });
const orderStatusSchema = z.enum(orderStatuses);
const orderActionSchema = z.enum(orderActions);
const fulfillmentTypeSchema = z.enum(fulfillmentTypes);

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string()
  })
});

const customerSchema = z.object({
  id: customerSelectSchema.shape.id,
  name: customerSelectSchema.shape.name,
  email: customerSelectSchema.shape.email,
  phone: customerSelectSchema.shape.phone
});

const orderItemSchema = z.object({
  id: z.string().uuid(),
  menuItemId: menuItemSelectSchema.shape.id,
  itemName: z.string(),
  quantity: z.number(),
  unitPriceCents: z.number(),
  lineTotalCents: z.number()
});

const orderSummarySchema = z.object({
  id: orderSelectSchema.shape.id,
  orderNumber: orderSelectSchema.shape.orderNumber,
  status: orderStatusSchema,
  fulfillmentType: fulfillmentTypeSchema,
  itemCount: z.number().int().min(0),
  channel: z.literal('dashboard'),
  location: z.literal('ody-bistro'),
  totalCents: orderSelectSchema.shape.totalCents,
  customer: customerSchema,
  availableActions: z.array(orderActionSchema),
  createdAt: z.string(),
  updatedAt: z.string()
});

const orderDetailSchema = orderSummarySchema.extend({
  items: z.array(orderItemSchema)
});

const createOrderBodySchema = z.object({
  customerId: customerSelectSchema.shape.id.optional(),
  customer: z.object({
    name: customerSelectSchema.shape.name.min(1),
    email: customerSelectSchema.shape.email.email(),
    phone: customerSelectSchema.shape.phone.min(1)
  }).optional(),
  fulfillmentType: fulfillmentTypeSchema,
  items: z.array(z.object({
    menuItemId: menuItemSelectSchema.shape.id,
    quantity: z.number().int().min(1).max(20)
  })).min(1).max(12)
}).refine((value) => Boolean(value.customerId) !== Boolean(value.customer), {
  message: 'Provide either customerId or customer.'
});

const performOrderActionBodySchema = z.object({
  action: orderActionSchema
});

const listOrdersRoute = createRoute({
  method: 'get',
  path: '/orders',
  operationId: 'listOrders',
  request: {
    query: z.object({
      status: orderStatusSchema.optional(),
      search: z.string().optional(),
      fulfillmentTypes: z.string().optional(),
      channel: z.string().optional(),
      location: z.string().optional()
    })
  },
  responses: {
    200: {
      description: 'Orders list',
      content: { 'application/json': { schema: z.object({ orders: z.array(orderSummarySchema) }) } }
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

const getOrderByIdRoute = createRoute({
  method: 'get',
  path: '/orders/{orderId}',
  operationId: 'getOrderById',
  request: {
    params: orderIdParamSchema
  },
  responses: {
    200: {
      description: 'Order detail',
      content: { 'application/json': { schema: z.object({ order: orderDetailSchema }) } }
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    404: {
      description: 'Order not found',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

const createOrderRoute = createRoute({
  method: 'post',
  path: '/orders',
  operationId: 'createOrder',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createOrderBodySchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Created order',
      content: { 'application/json': { schema: z.object({ order: orderDetailSchema }) } }
    },
    400: {
      description: 'Invalid order payload',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    404: {
      description: 'Referenced order resource not found',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

const performOrderActionRoute = createRoute({
  method: 'post',
  path: '/orders/{orderId}/actions',
  operationId: 'performOrderAction',
  request: {
    params: orderIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: performOrderActionBodySchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Updated order',
      content: { 'application/json': { schema: z.object({ order: orderDetailSchema }) } }
    },
    400: {
      description: 'Invalid order action',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    404: {
      description: 'Order not found',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

const listOrderCreateOptionsRoute = createRoute({
  method: 'get',
  path: '/orders/create-options',
  operationId: 'listOrderCreateOptions',
  responses: {
    200: {
      description: 'Order create options',
      content: {
        'application/json': {
          schema: z.object({
            customers: z.array(customerSchema),
            menuItems: z.array(z.object({
              id: menuItemSelectSchema.shape.id,
              name: menuItemSelectSchema.shape.name,
              priceCents: menuItemSelectSchema.shape.priceCents,
              isAvailable: menuItemSelectSchema.shape.isAvailable,
              categoryName: z.string()
            }))
          })
        }
      }
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

/**
 * Description: Implements isAuthorized.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
async function isAuthorized(authorization: string | undefined, databaseUrl: string, authSecret: string) {
  const token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : '';
  if (!token) return false;

  const db = createDb(databaseUrl);
  const user = await getUserFromToken(db, token, authSecret);
  return Boolean(user);
}

/**
 * Description: Implements toOrderError.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function toOrderError(error: unknown) {
  const message = error instanceof Error ? error.message : 'ORDER_ERROR';

  if (message === 'ORDER_NOT_FOUND') return { status: 404 as const, body: { error: { code: message, message: 'Order was not found.' } } };
  if (message === 'CUSTOMER_NOT_FOUND') return { status: 400 as const, body: { error: { code: message, message: 'Customer was not found.' } } };
  if (message === 'CUSTOMER_EMAIL_EXISTS') return { status: 400 as const, body: { error: { code: message, message: 'A customer with this email already exists.' } } };
  if (message === 'CUSTOMER_CREATE_FAILED') return { status: 400 as const, body: { error: { code: message, message: 'Customer could not be created.' } } };
  if (message === 'MENU_ITEM_NOT_FOUND') return { status: 400 as const, body: { error: { code: message, message: 'One or more menu items were not found.' } } };
  if (message === 'MENU_ITEM_UNAVAILABLE') return { status: 400 as const, body: { error: { code: message, message: 'Unavailable menu items cannot be ordered.' } } };
  if (message === 'INVALID_ORDER_ACTION') return { status: 400 as const, body: { error: { code: message, message: 'This action is not valid for the current order status.' } } };

  throw error;
}

/**
 * Description: Implements registerOrderRoutes.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function registerOrderRoutes(app: OpenAPIHono<AppEnv>) {
  app.openapi(listOrdersRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);

    const db = createDb(c.env.DATABASE_URL);
    const query = c.req.valid('query');
    return c.json({ orders: await listOrders(db, query) }, 200 as const);
  });

  app.openapi(listOrderCreateOptionsRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);

    return c.json(await listOrderCreateOptions(createDb(c.env.DATABASE_URL)), 200 as const);
  });

  app.openapi(getOrderByIdRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);

    const { orderId } = c.req.valid('param');
    const order = await getOrderById(createDb(c.env.DATABASE_URL), orderId);
    if (!order) return c.json({ error: { code: 'ORDER_NOT_FOUND', message: 'Order was not found.' } }, 404);

    return c.json({ order }, 200 as const);
  });

  app.openapi(createOrderRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);

    try {
      const order = await createOrder(createDb(c.env.DATABASE_URL), c.req.valid('json'));
      return c.json({ order }, 201);
    } catch (error) {
      const orderError = toOrderError(error);
      return c.json(orderError.body, orderError.status);
    }
  });

  app.openapi(performOrderActionRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);
    if (!authorized) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);

    try {
      const { orderId } = c.req.valid('param');
      const { action } = c.req.valid('json');
      const order = await performOrderAction(createDb(c.env.DATABASE_URL), orderId, action);
      return c.json({ order }, 200 as const);
    } catch (error) {
      const orderError = toOrderError(error);
      return c.json(orderError.body, orderError.status);
    }
  });
}
