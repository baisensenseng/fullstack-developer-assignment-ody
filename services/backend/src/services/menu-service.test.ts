import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { createDb } from '../db/client';
import { menuCategories, menuItems } from '../db/schema';
import { createMenuCategory, createMenuItem, updateMenuItem } from './menu-service';

config({ path: '../../.env' });
config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const db = createDb(databaseUrl);
const runId = randomUUID().slice(0, 8);
const categoryName = `Test Category ${runId}`;
const itemName = `Test Item ${runId}`;
let categoryId = '';
let itemId = '';

/**
 * Description: Implements cleanupMenuTestData.
 * Parameters: none.
 * Returns: Promise<void> after deleting test records.
 */
async function cleanupMenuTestData() {
  if (itemId) await db.delete(menuItems).where(eq(menuItems.id, itemId));
  if (categoryId) await db.delete(menuCategories).where(eq(menuCategories.id, categoryId));
}

describe('menu service', () => {
  before(async () => {
    await cleanupMenuTestData();
  });

  after(async () => {
    await cleanupMenuTestData();
  });

  test('creates a category and menu item with product details', async () => {
    const category = await createMenuCategory(db, { name: categoryName, sortOrder: 90 });
    categoryId = category.id;

    const item = await createMenuItem(db, {
      categoryId,
      name: itemName,
      priceCents: 1299,
      description: 'Integration test menu item',
      sku: `SKU-${runId}`,
      prepStation: 'Hot line',
      dietaryTags: 'vegetarian',
      isAvailable: true
    });
    itemId = item.id;

    assert.equal(item.name, itemName);
    assert.equal(item.categoryId, categoryId);
    assert.equal(item.description, 'Integration test menu item');
    assert.equal(item.sku, `SKU-${runId}`);
    assert.equal(item.prepStation, 'Hot line');
    assert.equal(item.dietaryTags, 'vegetarian');
    assert.equal(item.isAvailable, true);
    assert.equal(item.isArchived, false);
  });

  test('rejects duplicate item names', async () => {
    await assert.rejects(
      createMenuItem(db, {
        categoryId,
        name: itemName,
        priceCents: 1399,
        description: '',
        sku: `DUP-${runId}`,
        prepStation: 'Hot line',
        dietaryTags: '',
        isAvailable: true
      }),
      /MENU_ITEM_NAME_EXISTS/
    );
  });

  test('rejects invalid categories', async () => {
    await assert.rejects(
      createMenuItem(db, {
        categoryId: randomUUID(),
        name: `Missing Category Item ${runId}`,
        priceCents: 1399,
        description: '',
        sku: `MISS-${runId}`,
        prepStation: 'Hot line',
        dietaryTags: '',
        isAvailable: true
      }),
      /MENU_CATEGORY_NOT_FOUND/
    );
  });

  test('rejects invalid prices', async () => {
    await assert.rejects(
      createMenuItem(db, {
        categoryId,
        name: `Invalid Price Item ${runId}`,
        priceCents: 0,
        description: '',
        sku: `BAD-${runId}`,
        prepStation: 'Hot line',
        dietaryTags: '',
        isAvailable: true
      }),
      /INVALID_MENU_ITEM_PRICE/
    );
  });

  test('updates availability and archives menu items', async () => {
    const unavailable = await updateMenuItem(db, itemId, { isAvailable: false });
    assert.equal(unavailable.isAvailable, false);
    assert.equal(unavailable.isArchived, false);

    const archived = await updateMenuItem(db, itemId, { isArchived: true, isAvailable: false });
    assert.equal(archived.isArchived, true);
    assert.equal(archived.isAvailable, false);
  });
});
