import { boolean, integer, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_unique').on(table.email)
  })
);

export const menuCategories = pgTable(
  'menu_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    nameIdx: uniqueIndex('menu_categories_name_unique').on(table.name)
  })
);

export const menuItems = pgTable(
  'menu_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    categoryId: uuid('category_id').notNull().references(() => menuCategories.id),
    name: varchar('name', { length: 160 }).notNull(),
    priceCents: integer('price_cents').notNull(),
    description: varchar('description', { length: 500 }).default('').notNull(),
    sku: varchar('sku', { length: 80 }).default('').notNull(),
    prepStation: varchar('prep_station', { length: 80 }).default('Kitchen').notNull(),
    dietaryTags: varchar('dietary_tags', { length: 255 }).default('').notNull(),
    isAvailable: boolean('is_available').default(true).notNull(),
    isArchived: boolean('is_archived').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    nameIdx: uniqueIndex('menu_items_name_unique').on(table.name)
  })
);

export const customers = pgTable(
  'customers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 40 }).notNull(),
    notes: varchar('notes', { length: 1000 }).default('').notNull(),
    tags: varchar('tags', { length: 255 }).default('').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    emailIdx: uniqueIndex('customers_email_unique').on(table.email)
  })
);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderNumber: varchar('order_number', { length: 40 }).notNull(),
    customerId: uuid('customer_id').notNull().references(() => customers.id),
    status: varchar('status', { length: 40 }).notNull(),
    fulfillmentType: varchar('fulfillment_type', { length: 40 }).notNull(),
    totalCents: integer('total_cents').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    orderNumberIdx: uniqueIndex('orders_order_number_unique').on(table.orderNumber)
  })
);

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id),
  itemName: varchar('item_name', { length: 160 }).default('').notNull(),
  quantity: integer('quantity').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  lineTotalCents: integer('line_total_cents').default(0).notNull()
});

export const orderingSettings = pgTable('ordering_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  serviceAvailable: boolean('service_available').default(true).notNull(),
  autoAccept: boolean('auto_accept').default(false).notNull(),
  prepTimeMinutes: integer('prep_time_minutes').default(20).notNull(),
  businessName: varchar('business_name', { length: 160 }).default('Ody Bistro').notNull(),
  timezone: varchar('timezone', { length: 80 }).default('America/New_York').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  openingHours: varchar('opening_hours', { length: 255 }).default('Mon-Fri 09:00-21:00; Sat-Sun 10:00-22:00').notNull(),
  newOrderAlerts: boolean('new_order_alerts').default(true).notNull(),
  lowStockAlerts: boolean('low_stock_alerts').default(true).notNull(),
  dailyDigest: boolean('daily_digest').default(false).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});
