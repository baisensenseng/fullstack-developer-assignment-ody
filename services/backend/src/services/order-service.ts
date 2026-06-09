import { and, desc, eq, ilike, inArray, or } from 'drizzle-orm';
import { customers, menuCategories, menuItems, orderItems, orders } from '../db/schema';
import type { DbClient } from '../db/client';

export const orderStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'] as const;
export const orderActions = ['accept', 'start_preparing', 'mark_ready', 'complete', 'cancel'] as const;
export const fulfillmentTypes = ['pickup', 'delivery', 'dine-in'] as const;

export type OrderStatus = typeof orderStatuses[number];
export type OrderAction = typeof orderActions[number];
export type FulfillmentType = typeof fulfillmentTypes[number];

export type CreateOrderInput = {
  customerId?: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  fulfillmentType: FulfillmentType;
  items: Array<{ menuItemId: string; quantity: number }>;
};

export type ListOrdersInput = {
  status?: OrderStatus;
  search?: string;
  fulfillmentTypes?: string;
  channel?: string;
  location?: string;
};

const actionTransitions: Record<OrderAction, Partial<Record<OrderStatus, OrderStatus>>> = {
  accept: { pending: 'accepted' },
  start_preparing: { accepted: 'preparing' },
  mark_ready: { preparing: 'ready' },
  complete: { ready: 'completed' },
  cancel: { pending: 'cancelled', accepted: 'cancelled', preparing: 'cancelled' }
};

/**
 * Description: Implements isOrderStatus.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function isOrderStatus(status: string): status is OrderStatus {
  return orderStatuses.includes(status as OrderStatus);
}

/**
 * Description: Implements getAvailableActions.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function getAvailableActions(status: OrderStatus) {
  return orderActions.filter((action) => Boolean(actionTransitions[action][status]));
}

/**
 * Description: Implements createOrderNumber.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function createOrderNumber() {
  const timestamp = Date.now().toString().slice(-7);
  const suffix = crypto.randomUUID().slice(0, 4).toUpperCase();
  return `OD-${timestamp}-${suffix}`;
}

/**
 * Description: Implements normalizeStatus.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function normalizeStatus(status: string) {
  if (!isOrderStatus(status)) throw new Error('INVALID_ORDER_STATUS');
  return status;
}

/**
 * Description: Implements listOrders.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export async function listOrders(db: DbClient, input: ListOrdersInput = {}) {
  const fulfillmentTypeFilters = input.fulfillmentTypes?.split(',').filter((value): value is FulfillmentType => fulfillmentTypes.includes(value as FulfillmentType)) ?? [];

  if (input.channel !== undefined && input.channel !== 'dashboard') return [];
  if (input.location !== undefined && input.location !== 'ody-bistro') return [];
  if (input.fulfillmentTypes !== undefined && !fulfillmentTypeFilters.length) return [];

  const search = input.search?.trim();
  const conditions = [
    input.status ? eq(orders.status, input.status) : undefined,
    fulfillmentTypeFilters.length ? inArray(orders.fulfillmentType, fulfillmentTypeFilters) : undefined,
    search ? or(
      ilike(orders.orderNumber, `%${search}%`),
      ilike(orders.status, `%${search}%`),
      ilike(orders.fulfillmentType, `%${search}%`),
      ilike(customers.name, `%${search}%`),
      ilike(customers.email, `%${search}%`),
      ilike(customers.phone, `%${search}%`)
    ) : undefined
  ].filter((condition) => Boolean(condition));
  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      fulfillmentType: orders.fulfillmentType,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      customer: {
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone
      }
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt));
  const itemRows = rows.length ? await db.select({ orderId: orderItems.orderId }).from(orderItems).where(inArray(orderItems.orderId, rows.map((order) => order.id))) : [];
  const itemCountByOrderId = itemRows.reduce<Record<string, number>>((countByOrderId, item) => {
    countByOrderId[item.orderId] = (countByOrderId[item.orderId] ?? 0) + 1;
    return countByOrderId;
  }, {});

  return rows.map((order) => ({
    ...order,
    status: normalizeStatus(order.status),
    fulfillmentType: order.fulfillmentType as FulfillmentType,
    itemCount: itemCountByOrderId[order.id] ?? 0,
    channel: 'dashboard' as const,
    location: 'ody-bistro' as const,
    availableActions: getAvailableActions(normalizeStatus(order.status)),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString()
  }));
}

/**
 * Description: Implements getOrderById.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export async function getOrderById(db: DbClient, orderId: string) {
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      fulfillmentType: orders.fulfillmentType,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      customer: {
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone
      }
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      menuItemId: orderItems.menuItemId,
      itemName: orderItems.itemName,
      quantity: orderItems.quantity,
      unitPriceCents: orderItems.unitPriceCents,
      lineTotalCents: orderItems.lineTotalCents
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const status = normalizeStatus(order.status);

  return {
    ...order,
    status,
    fulfillmentType: order.fulfillmentType as FulfillmentType,
    itemCount: items.length,
    channel: 'dashboard' as const,
    location: 'ody-bistro' as const,
    availableActions: getAvailableActions(status),
    items,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString()
  };
}

/**
 * Description: Implements listOrderCreateOptions.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export async function listOrderCreateOptions(db: DbClient) {
  const customerRows = await db.select({ id: customers.id, name: customers.name, email: customers.email, phone: customers.phone }).from(customers).orderBy(customers.name);
  const itemRows = await db
    .select({
      id: menuItems.id,
      name: menuItems.name,
      priceCents: menuItems.priceCents,
      isAvailable: menuItems.isAvailable,
      categoryName: menuCategories.name
    })
    .from(menuItems)
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .where(and(eq(menuItems.isAvailable, true), eq(menuItems.isArchived, false)))
    .orderBy(menuCategories.sortOrder, menuItems.name);

  return { customers: customerRows, menuItems: itemRows };
}

/**
 * Description: Implements createOrder.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export async function createOrder(db: DbClient, input: CreateOrderInput) {
  let customerId = input.customerId;

  if (customerId) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');
  } else if (input.customer) {
    const [existingCustomer] = await db.select().from(customers).where(eq(customers.email, input.customer.email)).limit(1);
    if (existingCustomer) throw new Error('CUSTOMER_EMAIL_EXISTS');

    const [createdCustomer] = await db.insert(customers).values(input.customer).returning();
    if (!createdCustomer) throw new Error('CUSTOMER_CREATE_FAILED');
    customerId = createdCustomer.id;
  }

  if (!customerId) throw new Error('CUSTOMER_NOT_FOUND');

  const quantityByItemId = new Map<string, number>();
  for (const item of input.items) {
    quantityByItemId.set(item.menuItemId, (quantityByItemId.get(item.menuItemId) ?? 0) + item.quantity);
  }

  const menuItemIds = [...quantityByItemId.keys()];
  const selectedItems = await db.select().from(menuItems).where(inArray(menuItems.id, menuItemIds));
  if (selectedItems.length !== menuItemIds.length) throw new Error('MENU_ITEM_NOT_FOUND');

  const unavailableItem = selectedItems.find((item) => !item.isAvailable);
  if (unavailableItem) throw new Error('MENU_ITEM_UNAVAILABLE');

  const preparedItems = selectedItems.map((item) => {
    const quantity = quantityByItemId.get(item.id) ?? 0;
    const lineTotalCents = item.priceCents * quantity;
    return { menuItemId: item.id, itemName: item.name, quantity, unitPriceCents: item.priceCents, lineTotalCents };
  });

  const totalCents = preparedItems.reduce((total, item) => total + item.lineTotalCents, 0);
  const [createdOrder] = await db
    .insert(orders)
    .values({
      orderNumber: createOrderNumber(),
      customerId,
      status: 'pending',
      fulfillmentType: input.fulfillmentType,
      totalCents
    })
    .returning();

  if (!createdOrder) throw new Error('ORDER_CREATE_FAILED');

  await db.insert(orderItems).values(preparedItems.map((item) => ({ ...item, orderId: createdOrder.id })));
  const detail = await getOrderById(db, createdOrder.id);
  if (!detail) throw new Error('ORDER_CREATE_FAILED');
  return detail;
}

/**
 * Description: Implements performOrderAction.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export async function performOrderAction(db: DbClient, orderId: string, action: OrderAction) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error('ORDER_NOT_FOUND');

  const currentStatus = normalizeStatus(order.status);
  const nextStatus = actionTransitions[action][currentStatus];
  if (!nextStatus) throw new Error('INVALID_ORDER_ACTION');

  const [updatedOrder] = await db
    .update(orders)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, currentStatus)))
    .returning();

  if (!updatedOrder) throw new Error('ORDER_UPDATE_FAILED');

  const detail = await getOrderById(db, orderId);
  if (!detail) throw new Error('ORDER_NOT_FOUND');
  return detail;
}
