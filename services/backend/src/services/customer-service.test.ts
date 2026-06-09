import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { createDb } from '../db/client';
import { customers, menuCategories, menuItems, orderItems, orders } from '../db/schema';
import { createCustomer, getCustomerById, listCustomers, updateCustomer } from './customer-service';

config({ path: '../../.env' });
config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const db = createDb(databaseUrl);
const runId = randomUUID().slice(0, 8);
const email = `crm-${runId}@ody.local`;
const secondEmail = `crm-second-${runId}@ody.local`;
let customerId = '';
let secondCustomerId = '';
let categoryId = '';
let menuItemId = '';
let orderId = '';

/**
 * Description: Implements cleanupCustomerTestData.
 * Parameters: none.
 * Returns: Promise<void> after deleting CRM service test records.
 */
async function cleanupCustomerTestData() {
  if (orderId) {
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    await db.delete(orders).where(eq(orders.id, orderId));
  }
  if (menuItemId) await db.delete(menuItems).where(eq(menuItems.id, menuItemId));
  if (categoryId) await db.delete(menuCategories).where(eq(menuCategories.id, categoryId));
  if (customerId) await db.delete(customers).where(eq(customers.id, customerId));
  if (secondCustomerId) await db.delete(customers).where(eq(customers.id, secondCustomerId));
}

describe('customer service', () => {
  before(async () => {
    await cleanupCustomerTestData();
  });

  after(async () => {
    await cleanupCustomerTestData();
  });

  test('creates customers and rejects duplicate email addresses', async () => {
    const customer = await createCustomer(db, { name: `CRM Customer ${runId}`, email, phone: '+1 555 100 2000', notes: 'Likes patio seating', tags: 'vip, patio' });
    customerId = customer.id;

    assert.equal(customer.email, email);
    assert.equal(customer.notes, 'Likes patio seating');
    assert.equal(customer.tags, 'vip, patio');
    await assert.rejects(createCustomer(db, { name: 'Duplicate Customer', email, phone: '+1 555 999 0000', notes: '', tags: '' }), /CUSTOMER_EMAIL_EXISTS/);
  });

  test('updates customer notes and tags', async () => {
    const updated = await updateCustomer(db, customerId, { notes: 'Prefers booth seating', tags: 'vip, booth' });

    assert.equal(updated.notes, 'Prefers booth seating');
    assert.equal(updated.tags, 'vip, booth');
  });

  test('list customers returns order count and spend', async () => {
    const [category] = await db.insert(menuCategories).values({ name: `CRM Test Category ${runId}`, sortOrder: 95 }).returning();
    if (!category) throw new Error('CATEGORY_CREATE_FAILED');
    categoryId = category.id;
    const [menuItem] = await db.insert(menuItems).values({ categoryId, name: `CRM Test Burger ${runId}`, priceCents: 1225, description: 'CRM service test item', sku: `CRM-${runId}`, prepStation: 'Hot line', dietaryTags: '' }).returning();
    if (!menuItem) throw new Error('MENU_ITEM_CREATE_FAILED');
    menuItemId = menuItem.id;
    const [createdOrder] = await db.insert(orders).values({ orderNumber: `TEST-${runId}`, customerId, status: 'completed', fulfillmentType: 'dine_in', totalCents: 2450 }).returning();
    if (!createdOrder) throw new Error('ORDER_CREATE_FAILED');
    orderId = createdOrder.id;
    await db.insert(orderItems).values({ orderId, menuItemId, itemName: 'Test Burger', quantity: 2, unitPriceCents: 1225, lineTotalCents: 2450 });

    const result = await listCustomers(db, { search: email });
    const customer = result.customers.find((row) => row.id === customerId);

    assert.equal(customer?.orderCount, 1);
    assert.equal(customer?.totalSpendCents, 2450);
    assert.equal(result.summary.totalOrders, 1);
  });

  test('search filters by name, email, phone, notes, and tags', async () => {
    const secondCustomer = await createCustomer(db, { name: `Search Target ${runId}`, email: secondEmail, phone: '+1 555 333 4444', notes: 'Window table request', tags: 'brunch' });
    secondCustomerId = secondCustomer.id;

    assert.equal((await listCustomers(db, { search: `Search Target ${runId}` })).customers.some((customer) => customer.id === secondCustomerId), true);
    assert.equal((await listCustomers(db, { search: secondEmail })).customers.some((customer) => customer.id === secondCustomerId), true);
    assert.equal((await listCustomers(db, { search: '333 4444' })).customers.some((customer) => customer.id === secondCustomerId), true);
    assert.equal((await listCustomers(db, { search: 'Window table' })).customers.some((customer) => customer.id === secondCustomerId), true);
    assert.equal((await listCustomers(db, { search: 'brunch' })).customers.some((customer) => customer.id === secondCustomerId), true);
  });

  test('get customer detail returns order history', async () => {
    const detail = await getCustomerById(db, customerId);

    assert.equal(detail?.customer.id, customerId);
    assert.equal(detail?.orders.length, 1);
    assert.equal(detail?.orders[0]?.orderNumber, `TEST-${runId}`);
    assert.equal(detail?.orders[0]?.itemCount, 1);
  });

  test('missing customer returns null', async () => {
    assert.equal(await getCustomerById(db, randomUUID()), null);
  });
});
