import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { createDb } from '../db/client';
import { customers, menuCategories, menuItems, orderItems, orders } from '../db/schema';
import { createOrder, getOrderById, performOrderAction } from './order-service';

config({ path: '../../.env' });
config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const db = createDb(databaseUrl);
const runId = randomUUID().slice(0, 8);
let customerId = '';
let categoryId = '';
let availableItemId = '';
let unavailableItemId = '';
const orderIds: string[] = [];

/**
 * Description: Implements cleanupOrderTestData.
 * Parameters: none.
 * Returns: Promise<void> after deleting order service test records.
 */
async function cleanupOrderTestData() {
  for (const orderId of orderIds) {
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    await db.delete(orders).where(eq(orders.id, orderId));
  }
  if (availableItemId) await db.delete(menuItems).where(eq(menuItems.id, availableItemId));
  if (unavailableItemId) await db.delete(menuItems).where(eq(menuItems.id, unavailableItemId));
  if (categoryId) await db.delete(menuCategories).where(eq(menuCategories.id, categoryId));
  if (customerId) await db.delete(customers).where(eq(customers.id, customerId));
}

describe('order service', () => {
  before(async () => {
    await cleanupOrderTestData();
    const [customer] = await db.insert(customers).values({ name: `Order Customer ${runId}`, email: `orders-${runId}@ody.local`, phone: '+1 555 222 3333' }).returning();
    if (!customer) throw new Error('CUSTOMER_CREATE_FAILED');
    customerId = customer.id;
    const [category] = await db.insert(menuCategories).values({ name: `Order Category ${runId}`, sortOrder: 97 }).returning();
    if (!category) throw new Error('CATEGORY_CREATE_FAILED');
    categoryId = category.id;
    const [availableItem] = await db.insert(menuItems).values({ categoryId, name: `Order Burger ${runId}`, priceCents: 1550, description: 'Order service test item', sku: `ORD-${runId}`, prepStation: 'Hot line', dietaryTags: '', isAvailable: true }).returning();
    if (!availableItem) throw new Error('MENU_ITEM_CREATE_FAILED');
    availableItemId = availableItem.id;
    const [unavailableItem] = await db.insert(menuItems).values({ categoryId, name: `Unavailable Burger ${runId}`, priceCents: 990, description: 'Unavailable test item', sku: `UNV-${runId}`, prepStation: 'Hot line', dietaryTags: '', isAvailable: false }).returning();
    if (!unavailableItem) throw new Error('MENU_ITEM_CREATE_FAILED');
    unavailableItemId = unavailableItem.id;
  });

  after(async () => {
    await cleanupOrderTestData();
  });

  test('creates an order and calculates totals server-side', async () => {
    const order = await createOrder(db, { customerId, fulfillmentType: 'pickup', items: [{ menuItemId: availableItemId, quantity: 2 }] });
    orderIds.push(order.id);

    assert.equal(order.status, 'pending');
    assert.equal(order.totalCents, 3100);
    assert.equal(order.items.length, 1);
    assert.equal(order.items[0]?.itemName, `Order Burger ${runId}`);
    assert.equal(order.items[0]?.unitPriceCents, 1550);
    assert.equal(order.items[0]?.lineTotalCents, 3100);
  });

  test('rejects unavailable menu items', async () => {
    await assert.rejects(createOrder(db, { customerId, fulfillmentType: 'pickup', items: [{ menuItemId: unavailableItemId, quantity: 1 }] }), /MENU_ITEM_UNAVAILABLE/);
  });

  test('performs valid action transitions and rejects invalid actions', async () => {
    const order = await createOrder(db, { customerId, fulfillmentType: 'delivery', items: [{ menuItemId: availableItemId, quantity: 1 }] });
    orderIds.push(order.id);

    const accepted = await performOrderAction(db, order.id, 'accept');
    assert.equal(accepted.status, 'accepted');
    const preparing = await performOrderAction(db, order.id, 'start_preparing');
    assert.equal(preparing.status, 'preparing');
    await assert.rejects(performOrderAction(db, order.id, 'accept'), /INVALID_ORDER_ACTION/);
  });

  test('preserves item snapshots after menu price changes', async () => {
    const order = await createOrder(db, { customerId, fulfillmentType: 'dine-in', items: [{ menuItemId: availableItemId, quantity: 1 }] });
    orderIds.push(order.id);
    await db.update(menuItems).set({ name: `Updated Burger ${runId}`, priceCents: 2200 }).where(eq(menuItems.id, availableItemId));
    const detail = await getOrderById(db, order.id);

    assert.equal(detail?.items[0]?.itemName, `Order Burger ${runId}`);
    assert.equal(detail?.items[0]?.unitPriceCents, 1550);
    assert.equal(detail?.totalCents, 1550);
  });
});
