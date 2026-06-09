import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { customers, orderItems, orders } from '../db/schema';
import { normalizeStatus, type FulfillmentType } from './order-service';
import type { DbClient } from '../db/client';

export type ListCustomersInput = {
  search?: string;
};

export type CreateCustomerInput = {
  name: string;
  email: string;
  phone: string;
  notes: string;
  tags: string;
};

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

/**
 * Description: Implements toNumber.
 * Parameters: value unknown numeric database value.
 * Returns: number normalized finite number.
 */
function toNumber(value: unknown) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

/**
 * Description: Implements normalizeText.
 * Parameters: value string raw text value.
 * Returns: string normalized text.
 */
function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Description: Implements normalizeOptionalText.
 * Parameters: value string raw optional text value.
 * Returns: string normalized optional text.
 */
function normalizeOptionalText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Description: Implements assertUniqueCustomerEmail.
 * Parameters: db DbClient database client, email string customer email, customerId string optional current customer identifier.
 * Returns: Promise<void> when no conflicting email exists.
 */
async function assertUniqueCustomerEmail(db: DbClient, email: string, customerId?: string) {
  const [customer] = await db.select({ id: customers.id }).from(customers).where(eq(customers.email, email)).limit(1);
  if (customer && customer.id !== customerId) throw new Error('CUSTOMER_EMAIL_EXISTS');
}

/**
 * Description: Implements mapCustomerSummary.
 * Parameters: customer customer row with aggregate values.
 * Returns: normalized customer summary.
 */
function mapCustomerSummary(customer: { id: string; name: string; email: string; phone: string; notes: string; tags: string; createdAt: Date; updatedAt: Date; orderCount: unknown; totalSpendCents: unknown; lastOrderAt: Date | null }) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    notes: customer.notes,
    tags: customer.tags,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    orderCount: toNumber(customer.orderCount),
    totalSpendCents: toNumber(customer.totalSpendCents),
    lastOrderAt: customer.lastOrderAt ? new Date(customer.lastOrderAt).toISOString() : null
  };
}

/**
 * Description: Implements listCustomers.
 * Parameters: db DbClient database client, input ListCustomersInput customer filters.
 * Returns: Promise containing customer rows and CRM summary.
 */
export async function listCustomers(db: DbClient, input: ListCustomersInput = {}) {
  const search = input.search?.trim();
  const conditions = [
    search ? or(ilike(customers.name, `%${search}%`), ilike(customers.email, `%${search}%`), ilike(customers.phone, `%${search}%`), ilike(customers.notes, `%${search}%`), ilike(customers.tags, `%${search}%`)) : undefined
  ].filter((condition) => Boolean(condition));

  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      notes: customers.notes,
      tags: customers.tags,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
      orderCount: sql<number>`count(${orders.id})`,
      totalSpendCents: sql<number>`coalesce(sum(case when ${orders.status} <> 'cancelled' then ${orders.totalCents} else 0 end), 0)`,
      lastOrderAt: sql<Date | null>`max(${orders.createdAt})`
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(customers.id, customers.name, customers.email, customers.phone, customers.notes, customers.tags, customers.createdAt, customers.updatedAt)
    .orderBy(desc(sql`max(${orders.createdAt})`), customers.name);

  const mappedRows = rows.map(mapCustomerSummary);
  const totalSpendCents = mappedRows.reduce((total, customer) => total + customer.totalSpendCents, 0);
  const totalOrders = mappedRows.reduce((total, customer) => total + customer.orderCount, 0);

  return {
    customers: mappedRows,
    summary: {
      totalCustomers: mappedRows.length,
      activeCustomers: mappedRows.filter((customer) => customer.orderCount > 0).length,
      totalSpendCents,
      averageSpendCents: mappedRows.length ? Math.round(totalSpendCents / mappedRows.length) : 0,
      totalOrders
    }
  };
}

/**
 * Description: Implements createCustomer.
 * Parameters: db DbClient database client, input CreateCustomerInput customer payload.
 * Returns: Promise containing the created customer detail.
 */
export async function createCustomer(db: DbClient, input: CreateCustomerInput) {
  const name = normalizeText(input.name);
  const email = normalizeText(input.email).toLowerCase();
  const phone = normalizeText(input.phone);
  if (!name) throw new Error('CUSTOMER_NAME_REQUIRED');
  if (!email) throw new Error('CUSTOMER_EMAIL_REQUIRED');
  if (!phone) throw new Error('CUSTOMER_PHONE_REQUIRED');
  await assertUniqueCustomerEmail(db, email);

  const [createdCustomer] = await db.insert(customers).values({ name, email, phone, notes: normalizeOptionalText(input.notes), tags: normalizeOptionalText(input.tags) }).returning();
  if (!createdCustomer) throw new Error('CUSTOMER_CREATE_FAILED');
  const detail = await getCustomerById(db, createdCustomer.id);
  if (!detail) throw new Error('CUSTOMER_CREATE_FAILED');
  return detail.customer;
}

/**
 * Description: Implements updateCustomer.
 * Parameters: db DbClient database client, customerId string customer identifier, input UpdateCustomerInput customer patch.
 * Returns: Promise containing the updated customer detail.
 */
export async function updateCustomer(db: DbClient, customerId: string, input: UpdateCustomerInput) {
  const [currentCustomer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  if (!currentCustomer) throw new Error('CUSTOMER_NOT_FOUND');

  const name = input.name === undefined ? currentCustomer.name : normalizeText(input.name);
  const email = input.email === undefined ? currentCustomer.email : normalizeText(input.email).toLowerCase();
  const phone = input.phone === undefined ? currentCustomer.phone : normalizeText(input.phone);
  if (!name) throw new Error('CUSTOMER_NAME_REQUIRED');
  if (!email) throw new Error('CUSTOMER_EMAIL_REQUIRED');
  if (!phone) throw new Error('CUSTOMER_PHONE_REQUIRED');
  await assertUniqueCustomerEmail(db, email, customerId);

  const [updatedCustomer] = await db.update(customers).set({
    name,
    email,
    phone,
    notes: input.notes === undefined ? currentCustomer.notes : normalizeOptionalText(input.notes),
    tags: input.tags === undefined ? currentCustomer.tags : normalizeOptionalText(input.tags),
    updatedAt: new Date()
  }).where(eq(customers.id, customerId)).returning();
  if (!updatedCustomer) throw new Error('CUSTOMER_UPDATE_FAILED');

  const detail = await getCustomerById(db, updatedCustomer.id);
  if (!detail) throw new Error('CUSTOMER_UPDATE_FAILED');
  return detail.customer;
}

/**
 * Description: Implements getCustomerById.
 * Parameters: db DbClient database client, customerId string customer identifier.
 * Returns: Promise containing customer detail or null.
 */
export async function getCustomerById(db: DbClient, customerId: string) {
  const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  if (!customer) return null;

  const orderRows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      fulfillmentType: orders.fulfillmentType,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      itemCount: sql<number>`count(${orderItems.id})`
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(eq(orders.customerId, customerId))
    .groupBy(orders.id, orders.orderNumber, orders.status, orders.fulfillmentType, orders.totalCents, orders.createdAt, orders.updatedAt)
    .orderBy(desc(orders.createdAt));

  const mappedOrders = orderRows.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: normalizeStatus(order.status),
    fulfillmentType: order.fulfillmentType as FulfillmentType,
    itemCount: toNumber(order.itemCount),
    totalCents: order.totalCents,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString()
  }));
  const totalSpendCents = mappedOrders.reduce((total, order) => total + (order.status === 'cancelled' ? 0 : order.totalCents), 0);

  return {
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      notes: customer.notes,
      tags: customer.tags,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      orderCount: mappedOrders.length,
      totalSpendCents,
      averageOrderValueCents: mappedOrders.length ? Math.round(totalSpendCents / mappedOrders.length) : 0,
      lastOrderAt: mappedOrders[0]?.createdAt ?? null
    },
    orders: mappedOrders
  };
}
