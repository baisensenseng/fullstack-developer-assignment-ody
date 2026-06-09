import { createRoute, z } from '@hono/zod-openapi';
import { desc, eq, sql } from 'drizzle-orm';
import { createDb } from '../db/client';
import { customers, menuCategories, menuItems, orderItems, orderingSettings, orders } from '../db/schema';
import type { AppEnv } from '../env';
import { getUserFromToken } from '../services/auth-service';
import type { OpenAPIHono } from '@hono/zod-openapi';

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string()
  })
});

const orderStatusSchema = z.enum(['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled']);

const summaryResponseSchema = z.object({
  totals: z.object({
    totalOrders: z.number(),
    revenueCents: z.number(),
    pendingOrders: z.number(),
    averageOrderValueCents: z.number()
  }),
  recentOrders: z.array(z.object({
    id: z.string().uuid(),
    orderNumber: z.string(),
    customerName: z.string(),
    status: orderStatusSchema,
    fulfillmentType: z.string(),
    totalCents: z.number(),
    createdAt: z.string()
  })),
  popularItems: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    categoryName: z.string(),
    quantitySold: z.number(),
    revenueCents: z.number()
  })),
  orderingStatus: z.object({
    serviceAvailable: z.boolean(),
    autoAccept: z.boolean(),
    prepTimeMinutes: z.number()
  })
});

const getSummaryRoute = createRoute({
  method: 'get',
  path: '/summary',
  operationId: 'getDashboardSummary',
  responses: {
    200: {
      description: 'Dashboard summary',
      content: { 'application/json': { schema: summaryResponseSchema } }
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
 * Description: Implements toNumber.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function toNumber(value: unknown) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

/**
 * Description: Implements registerSummaryRoutes.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function registerSummaryRoutes(app: OpenAPIHono<AppEnv>) {
  app.openapi(getSummaryRoute, async (c) => {
    const authorized = await isAuthorized(c.req.header('Authorization'), c.env.DATABASE_URL, c.env.AUTH_SECRET);

    if (!authorized) {
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);
    }

    const db = createDb(c.env.DATABASE_URL);
    const [totalsRow] = await db
      .select({
        totalOrders: sql<number>`count(${orders.id})`,
        revenueCents: sql<number>`coalesce(sum(case when ${orders.status} <> 'cancelled' then ${orders.totalCents} else 0 end), 0)`,
        pendingOrders: sql<number>`coalesce(sum(case when ${orders.status} = 'pending' then 1 else 0 end), 0)`,
        averageOrderValueCents: sql<number>`coalesce(round(avg(case when ${orders.status} <> 'cancelled' then ${orders.totalCents} end)), 0)`
      })
      .from(orders);

    const recentRows = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerName: customers.name,
        status: orders.status,
        fulfillmentType: orders.fulfillmentType,
        totalCents: orders.totalCents,
        createdAt: orders.createdAt
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .orderBy(desc(orders.createdAt))
      .limit(6);

    const popularRows = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        categoryName: menuCategories.name,
        quantitySold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
        revenueCents: sql<number>`coalesce(sum(${orderItems.quantity} * ${orderItems.unitPriceCents}), 0)`
      })
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
      .groupBy(menuItems.id, menuItems.name, menuCategories.name)
      .orderBy(sql`sum(${orderItems.quantity}) desc`)
      .limit(5);

    const [statusRow] = await db.select().from(orderingSettings).limit(1);

    return c.json({
      totals: {
        totalOrders: toNumber(totalsRow?.totalOrders),
        revenueCents: toNumber(totalsRow?.revenueCents),
        pendingOrders: toNumber(totalsRow?.pendingOrders),
        averageOrderValueCents: toNumber(totalsRow?.averageOrderValueCents)
      },
      recentOrders: recentRows.map((order) => ({
        ...order,
        status: order.status as z.infer<typeof orderStatusSchema>,
        createdAt: order.createdAt.toISOString()
      })),
      popularItems: popularRows.map((item) => ({
        ...item,
        quantitySold: toNumber(item.quantitySold),
        revenueCents: toNumber(item.revenueCents)
      })),
      orderingStatus: {
        serviceAvailable: statusRow?.serviceAvailable ?? true,
        autoAccept: statusRow?.autoAccept ?? false,
        prepTimeMinutes: statusRow?.prepTimeMinutes ?? 20
      }
    }, 200 as const);
  });
}
