import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config({ path: '../../.env' });
config();
import { createDb } from './client';
import { customers, menuCategories, menuItems, orderingSettings, orderItems, orders, users } from './schema';
import { hashPassword } from '../services/password';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required.');
}

const db = createDb(databaseUrl);

const ids = {
  categories: {
    breakfast: '11111111-1111-4111-8111-111111111111',
    mains: '22222222-2222-4222-8222-222222222222',
    drinks: '33333333-3333-4333-8333-333333333333'
  },
  items: {
    toast: '44444444-4444-4444-8444-444444444444',
    salad: '55555555-5555-4555-8555-555555555555',
    pasta: '66666666-6666-4666-8666-666666666666',
    latte: '77777777-7777-4777-8777-777777777777',
    tea: '88888888-8888-4888-8888-888888888888'
  },
  customers: {
    maya: '99999999-9999-4999-8999-999999999999',
    theo: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    nina: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    ellis: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
  },
  orders: {
    one: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    two: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    three: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
    four: '12121212-1212-4121-8121-121212121212',
    five: '23232323-2323-4232-8232-232323232323',
    six: '34343434-3434-4343-8343-343434343434'
  },
  settings: '45454545-4545-4454-8454-454545454545'
};

await db
  .insert(users)
  .values({
    name: 'Demo Manager',
    email: 'demo@ody.local',
    passwordHash: await hashPassword('password123')
  })
  .onConflictDoNothing({ target: users.email });

await db.insert(menuCategories).values([
  { id: ids.categories.breakfast, name: 'Breakfast', sortOrder: 1 },
  { id: ids.categories.mains, name: 'Mains', sortOrder: 2 },
  { id: ids.categories.drinks, name: 'Drinks', sortOrder: 3 }
]).onConflictDoNothing({ target: menuCategories.id });

await db.insert(menuItems).values([
  { id: ids.items.toast, categoryId: ids.categories.breakfast, name: 'Sourdough Avocado Toast', priceCents: 1425, description: 'Toasted sourdough with avocado, herbs, and citrus.', sku: 'BRK-AVO-001', prepStation: 'Cold line', dietaryTags: 'vegetarian', isAvailable: true },
  { id: ids.items.salad, categoryId: ids.categories.mains, name: 'Charred Citrus Salad', priceCents: 1680, description: 'Seasonal greens, charred citrus, and toasted seeds.', sku: 'MAIN-SAL-001', prepStation: 'Cold line', dietaryTags: 'vegan,gluten-free', isAvailable: true },
  { id: ids.items.pasta, categoryId: ids.categories.mains, name: 'Brown Butter Rigatoni', priceCents: 2240, description: 'Rigatoni with brown butter, parmesan, and herbs.', sku: 'MAIN-PASTA-001', prepStation: 'Hot line', dietaryTags: 'vegetarian', isAvailable: true },
  { id: ids.items.latte, categoryId: ids.categories.drinks, name: 'Oat Milk Latte', priceCents: 625, description: 'Espresso with steamed oat milk.', sku: 'DRK-LAT-001', prepStation: 'Bar', dietaryTags: 'vegan', isAvailable: true },
  { id: ids.items.tea, categoryId: ids.categories.drinks, name: 'Iced Jasmine Tea', priceCents: 540, description: 'Cold jasmine tea with light citrus.', sku: 'DRK-TEA-001', prepStation: 'Bar', dietaryTags: 'vegan', isAvailable: false }
]).onConflictDoUpdate({
  target: menuItems.id,
  set: {
    categoryId: sql`excluded.category_id`,
    name: sql`excluded.name`,
    priceCents: sql`excluded.price_cents`,
    description: sql`excluded.description`,
    sku: sql`excluded.sku`,
    prepStation: sql`excluded.prep_station`,
    dietaryTags: sql`excluded.dietary_tags`,
    isAvailable: sql`excluded.is_available`
  }
});

await db.insert(customers).values([
  { id: ids.customers.maya, name: 'Maya Rios', email: 'maya.rios@example.com', phone: '+1 (312) 847-1928', notes: 'Prefers pickup and oat milk drinks.', tags: 'regular,pickup' },
  { id: ids.customers.theo, name: 'Theo Mercer', email: 'theo.mercer@example.com', phone: '+1 (415) 629-3841', notes: 'Often orders delivery for office lunches.', tags: 'delivery' },
  { id: ids.customers.nina, name: 'Nina Okafor', email: 'nina.okafor@example.com', phone: '+1 (646) 208-7742', notes: 'Likes salads and jasmine tea.', tags: 'healthy,regular' },
  { id: ids.customers.ellis, name: 'Ellis Vaughn', email: 'ellis.vaughn@example.com', phone: '+1 (206) 491-0386', notes: 'Usually dines in during lunch service.', tags: 'dine-in' }
]).onConflictDoUpdate({
  target: customers.id,
  set: {
    name: sql`excluded.name`,
    email: sql`excluded.email`,
    phone: sql`excluded.phone`,
    notes: sql`excluded.notes`,
    tags: sql`excluded.tags`
  }
});

await db.insert(orders).values([
  { id: ids.orders.one, orderNumber: 'OD-1048', customerId: ids.customers.maya, status: 'pending', fulfillmentType: 'pickup', totalCents: 2865, createdAt: new Date('2026-06-08T13:42:00.000Z'), updatedAt: new Date('2026-06-08T13:45:00.000Z') },
  { id: ids.orders.two, orderNumber: 'OD-1047', customerId: ids.customers.theo, status: 'preparing', fulfillmentType: 'delivery', totalCents: 4545, createdAt: new Date('2026-06-08T13:18:00.000Z'), updatedAt: new Date('2026-06-08T13:27:00.000Z') },
  { id: ids.orders.three, orderNumber: 'OD-1046', customerId: ids.customers.nina, status: 'ready', fulfillmentType: 'pickup', totalCents: 2305, createdAt: new Date('2026-06-08T12:56:00.000Z'), updatedAt: new Date('2026-06-08T13:08:00.000Z') },
  { id: ids.orders.four, orderNumber: 'OD-1045', customerId: ids.customers.ellis, status: 'completed', fulfillmentType: 'dine-in', totalCents: 6160, createdAt: new Date('2026-06-08T12:24:00.000Z'), updatedAt: new Date('2026-06-08T12:52:00.000Z') },
  { id: ids.orders.five, orderNumber: 'OD-1044', customerId: ids.customers.maya, status: 'completed', fulfillmentType: 'pickup', totalCents: 3705, createdAt: new Date('2026-06-08T11:37:00.000Z'), updatedAt: new Date('2026-06-08T12:02:00.000Z') },
  { id: ids.orders.six, orderNumber: 'OD-1043', customerId: ids.customers.theo, status: 'cancelled', fulfillmentType: 'delivery', totalCents: 1680, createdAt: new Date('2026-06-08T10:58:00.000Z'), updatedAt: new Date('2026-06-08T11:04:00.000Z') }
]).onConflictDoUpdate({
  target: orders.id,
  set: {
    status: sql`excluded.status`,
    fulfillmentType: sql`excluded.fulfillment_type`,
    totalCents: sql`excluded.total_cents`,
    createdAt: sql`excluded.created_at`,
    updatedAt: sql`excluded.updated_at`
  }
});

await db.insert(orderItems).values([
  { id: '56565656-5656-4565-8565-565656565656', orderId: ids.orders.one, menuItemId: ids.items.toast, itemName: 'Sourdough Avocado Toast', quantity: 1, unitPriceCents: 1425, lineTotalCents: 1425 },
  { id: '67676767-6767-4676-8676-676767676767', orderId: ids.orders.one, menuItemId: ids.items.latte, itemName: 'Oat Milk Latte', quantity: 2, unitPriceCents: 625, lineTotalCents: 1250 },
  { id: '78787878-7878-4787-8787-787878787878', orderId: ids.orders.two, menuItemId: ids.items.pasta, itemName: 'Brown Butter Rigatoni', quantity: 2, unitPriceCents: 2240, lineTotalCents: 4480 },
  { id: '89898989-8989-4898-8898-898989898989', orderId: ids.orders.three, menuItemId: ids.items.salad, itemName: 'Charred Citrus Salad', quantity: 1, unitPriceCents: 1680, lineTotalCents: 1680 },
  { id: '90909090-9090-4909-8909-909090909090', orderId: ids.orders.three, menuItemId: ids.items.latte, itemName: 'Oat Milk Latte', quantity: 1, unitPriceCents: 625, lineTotalCents: 625 },
  { id: 'abababab-abab-4aba-8aba-abababababab', orderId: ids.orders.four, menuItemId: ids.items.pasta, itemName: 'Brown Butter Rigatoni', quantity: 2, unitPriceCents: 2240, lineTotalCents: 4480 },
  { id: 'bcbcbcbc-bcbc-4bcb-8bcb-bcbcbcbcbcbc', orderId: ids.orders.four, menuItemId: ids.items.salad, itemName: 'Charred Citrus Salad', quantity: 1, unitPriceCents: 1680, lineTotalCents: 1680 },
  { id: 'cdcdcdcd-cdcd-4cdc-8cdc-cdcdcdcdcdcd', orderId: ids.orders.five, menuItemId: ids.items.toast, itemName: 'Sourdough Avocado Toast', quantity: 2, unitPriceCents: 1425, lineTotalCents: 2850 },
  { id: 'dededede-dede-4ded-8ded-dededededede', orderId: ids.orders.five, menuItemId: ids.items.latte, itemName: 'Oat Milk Latte', quantity: 1, unitPriceCents: 625, lineTotalCents: 625 },
  { id: 'efefefef-efef-4efe-8efe-efefefefefef', orderId: ids.orders.six, menuItemId: ids.items.salad, itemName: 'Charred Citrus Salad', quantity: 1, unitPriceCents: 1680, lineTotalCents: 1680 }
]).onConflictDoNothing({ target: orderItems.id });

await db.insert(orderingSettings).values({
  id: ids.settings,
  serviceAvailable: true,
  autoAccept: false,
  prepTimeMinutes: 24,
  businessName: 'Ody Bistro',
  timezone: 'America/New_York',
  currency: 'USD',
  openingHours: 'Mon-Fri 09:00-21:00; Sat-Sun 10:00-22:00',
  newOrderAlerts: true,
  lowStockAlerts: true,
  dailyDigest: false
}).onConflictDoUpdate({
  target: orderingSettings.id,
  set: {
    serviceAvailable: sql`excluded.service_available`,
    autoAccept: sql`excluded.auto_accept`,
    prepTimeMinutes: sql`excluded.prep_time_minutes`,
    businessName: sql`excluded.business_name`,
    timezone: sql`excluded.timezone`,
    currency: sql`excluded.currency`,
    openingHours: sql`excluded.opening_hours`,
    newOrderAlerts: sql`excluded.new_order_alerts`,
    lowStockAlerts: sql`excluded.low_stock_alerts`,
    dailyDigest: sql`excluded.daily_digest`
  }
});

console.log('Seed completed.');
