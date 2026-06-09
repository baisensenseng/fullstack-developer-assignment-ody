import { and, asc, count, eq, ilike, or } from 'drizzle-orm';
import { menuCategories, menuItems } from '../db/schema';
import type { DbClient } from '../db/client';

export const menuAvailabilityFilters = ['all', 'available', 'unavailable', 'archived'] as const;

export type MenuAvailabilityFilter = typeof menuAvailabilityFilters[number];

export type ListMenuInput = {
  search?: string;
  categoryId?: string;
  availability?: MenuAvailabilityFilter;
};

export type CreateMenuCategoryInput = {
  name: string;
  sortOrder: number;
};

export type UpdateMenuCategoryInput = Partial<CreateMenuCategoryInput>;

export type CreateMenuItemInput = {
  categoryId: string;
  name: string;
  priceCents: number;
  description: string;
  sku: string;
  prepStation: string;
  dietaryTags: string;
  isAvailable: boolean;
};

export type UpdateMenuItemInput = Partial<CreateMenuItemInput> & {
  isArchived?: boolean;
};

/**
 * Description: Implements normalizeText.
 * Parameters: value string raw text value.
 * Returns: string normalized text value.
 */
function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Description: Implements normalizeOptionalText.
 * Parameters: value string raw optional text value.
 * Returns: string normalized optional text value.
 */
function normalizeOptionalText(value: string) {
  return normalizeText(value).slice(0);
}

/**
 * Description: Implements assertValidPrice.
 * Parameters: priceCents number item price in cents.
 * Returns: void when the price is valid.
 */
function assertValidPrice(priceCents: number) {
  if (!Number.isInteger(priceCents) || priceCents <= 0) throw new Error('INVALID_MENU_ITEM_PRICE');
}

/**
 * Description: Implements assertValidSortOrder.
 * Parameters: sortOrder number category sort order.
 * Returns: void when the sort order is valid.
 */
function assertValidSortOrder(sortOrder: number) {
  if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error('INVALID_MENU_CATEGORY_SORT_ORDER');
}

/**
 * Description: Implements assertCategoryExists.
 * Parameters: db DbClient database client, categoryId string category identifier.
 * Returns: Promise<void> when the category exists.
 */
async function assertCategoryExists(db: DbClient, categoryId: string) {
  const [category] = await db.select({ id: menuCategories.id }).from(menuCategories).where(eq(menuCategories.id, categoryId)).limit(1);
  if (!category) throw new Error('MENU_CATEGORY_NOT_FOUND');
}

/**
 * Description: Implements assertUniqueCategoryName.
 * Parameters: db DbClient database client, name string category name, categoryId string optional current category identifier.
 * Returns: Promise<void> when no conflicting category exists.
 */
async function assertUniqueCategoryName(db: DbClient, name: string, categoryId?: string) {
  const [category] = await db.select({ id: menuCategories.id }).from(menuCategories).where(eq(menuCategories.name, name)).limit(1);
  if (category && category.id !== categoryId) throw new Error('MENU_CATEGORY_NAME_EXISTS');
}

/**
 * Description: Implements assertUniqueItemName.
 * Parameters: db DbClient database client, name string item name, itemId string optional current item identifier.
 * Returns: Promise<void> when no conflicting item exists.
 */
async function assertUniqueItemName(db: DbClient, name: string, itemId?: string) {
  const [item] = await db.select({ id: menuItems.id }).from(menuItems).where(eq(menuItems.name, name)).limit(1);
  if (item && item.id !== itemId) throw new Error('MENU_ITEM_NAME_EXISTS');
}

/**
 * Description: Implements listMenu.
 * Parameters: db DbClient database client, input ListMenuInput menu filters.
 * Returns: Promise containing categories, filtered items, and menu summary.
 */
export async function listMenu(db: DbClient, input: ListMenuInput = {}) {
  const categoryRows = await db
    .select({ id: menuCategories.id, name: menuCategories.name, sortOrder: menuCategories.sortOrder, createdAt: menuCategories.createdAt, itemCount: count(menuItems.id) })
    .from(menuCategories)
    .leftJoin(menuItems, and(eq(menuItems.categoryId, menuCategories.id), eq(menuItems.isArchived, false)))
    .groupBy(menuCategories.id, menuCategories.name, menuCategories.sortOrder, menuCategories.createdAt)
    .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.name));

  const search = input.search?.trim();
  const conditions = [
    input.categoryId ? eq(menuItems.categoryId, input.categoryId) : undefined,
    input.availability === 'archived' ? eq(menuItems.isArchived, true) : eq(menuItems.isArchived, false),
    input.availability === 'available' ? eq(menuItems.isAvailable, true) : undefined,
    input.availability === 'unavailable' ? eq(menuItems.isAvailable, false) : undefined,
    search ? or(ilike(menuItems.name, `%${search}%`), ilike(menuCategories.name, `%${search}%`), ilike(menuItems.description, `%${search}%`), ilike(menuItems.sku, `%${search}%`), ilike(menuItems.prepStation, `%${search}%`), ilike(menuItems.dietaryTags, `%${search}%`)) : undefined
  ].filter((condition) => Boolean(condition));

  const rows = await db
    .select({
      id: menuItems.id,
      categoryId: menuItems.categoryId,
      categoryName: menuCategories.name,
      name: menuItems.name,
      priceCents: menuItems.priceCents,
      description: menuItems.description,
      sku: menuItems.sku,
      prepStation: menuItems.prepStation,
      dietaryTags: menuItems.dietaryTags,
      isAvailable: menuItems.isAvailable,
      isArchived: menuItems.isArchived,
      createdAt: menuItems.createdAt
    })
    .from(menuItems)
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(menuCategories.sortOrder), asc(menuItems.name));

  const summary = rows.reduce(
    (current, item) => ({
      totalItems: current.totalItems + 1,
      availableItems: current.availableItems + (!item.isArchived && item.isAvailable ? 1 : 0),
      unavailableItems: current.unavailableItems + (!item.isArchived && !item.isAvailable ? 1 : 0),
      archivedItems: current.archivedItems + (item.isArchived ? 1 : 0),
      categoryCount: categoryRows.length
    }),
    { totalItems: 0, availableItems: 0, unavailableItems: 0, archivedItems: 0, categoryCount: categoryRows.length }
  );

  return {
    categories: categoryRows.map((category) => ({ ...category, itemCount: Number(category.itemCount), createdAt: category.createdAt.toISOString() })),
    items: rows.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
    summary
  };
}

/**
 * Description: Implements createMenuCategory.
 * Parameters: db DbClient database client, input CreateMenuCategoryInput category payload.
 * Returns: Promise containing the created menu category.
 */
export async function createMenuCategory(db: DbClient, input: CreateMenuCategoryInput) {
  const name = normalizeText(input.name);
  if (!name) throw new Error('MENU_CATEGORY_NAME_REQUIRED');
  assertValidSortOrder(input.sortOrder);
  await assertUniqueCategoryName(db, name);

  const [createdCategory] = await db.insert(menuCategories).values({ name, sortOrder: input.sortOrder }).returning();
  if (!createdCategory) throw new Error('MENU_CATEGORY_CREATE_FAILED');

  return { ...createdCategory, itemCount: 0, createdAt: createdCategory.createdAt.toISOString() };
}

/**
 * Description: Implements updateMenuCategory.
 * Parameters: db DbClient database client, categoryId string category identifier, input UpdateMenuCategoryInput category patch.
 * Returns: Promise containing the updated menu category.
 */
export async function updateMenuCategory(db: DbClient, categoryId: string, input: UpdateMenuCategoryInput) {
  const [currentCategory] = await db.select().from(menuCategories).where(eq(menuCategories.id, categoryId)).limit(1);
  if (!currentCategory) throw new Error('MENU_CATEGORY_NOT_FOUND');

  const name = input.name === undefined ? currentCategory.name : normalizeText(input.name);
  if (!name) throw new Error('MENU_CATEGORY_NAME_REQUIRED');
  const sortOrder = input.sortOrder ?? currentCategory.sortOrder;
  assertValidSortOrder(sortOrder);
  await assertUniqueCategoryName(db, name, categoryId);

  const [updatedCategory] = await db.update(menuCategories).set({ name, sortOrder }).where(eq(menuCategories.id, categoryId)).returning();
  if (!updatedCategory) throw new Error('MENU_CATEGORY_UPDATE_FAILED');

  const [itemCountRow] = await db.select({ itemCount: count(menuItems.id) }).from(menuItems).where(and(eq(menuItems.categoryId, categoryId), eq(menuItems.isArchived, false)));
  return { ...updatedCategory, itemCount: Number(itemCountRow?.itemCount ?? 0), createdAt: updatedCategory.createdAt.toISOString() };
}

/**
 * Description: Implements createMenuItem.
 * Parameters: db DbClient database client, input CreateMenuItemInput item payload.
 * Returns: Promise containing the created menu item.
 */
export async function createMenuItem(db: DbClient, input: CreateMenuItemInput) {
  const name = normalizeText(input.name);
  if (!name) throw new Error('MENU_ITEM_NAME_REQUIRED');
  assertValidPrice(input.priceCents);
  await assertCategoryExists(db, input.categoryId);
  await assertUniqueItemName(db, name);

  const [createdItem] = await db
    .insert(menuItems)
    .values({
      categoryId: input.categoryId,
      name,
      priceCents: input.priceCents,
      description: normalizeOptionalText(input.description),
      sku: normalizeOptionalText(input.sku),
      prepStation: normalizeOptionalText(input.prepStation) || 'Kitchen',
      dietaryTags: normalizeOptionalText(input.dietaryTags),
      isAvailable: input.isAvailable,
      isArchived: false
    })
    .returning();

  if (!createdItem) throw new Error('MENU_ITEM_CREATE_FAILED');

  const menu = await listMenu(db, { search: name });
  const item = menu.items.find((menuItem) => menuItem.id === createdItem.id);
  if (!item) throw new Error('MENU_ITEM_CREATE_FAILED');
  return item;
}

/**
 * Description: Implements updateMenuItem.
 * Parameters: db DbClient database client, itemId string menu item identifier, input UpdateMenuItemInput item patch.
 * Returns: Promise containing the updated menu item.
 */
export async function updateMenuItem(db: DbClient, itemId: string, input: UpdateMenuItemInput) {
  const [currentItem] = await db.select().from(menuItems).where(eq(menuItems.id, itemId)).limit(1);
  if (!currentItem) throw new Error('MENU_ITEM_NOT_FOUND');

  const name = input.name === undefined ? currentItem.name : normalizeText(input.name);
  if (!name) throw new Error('MENU_ITEM_NAME_REQUIRED');
  const priceCents = input.priceCents ?? currentItem.priceCents;
  assertValidPrice(priceCents);

  const categoryId = input.categoryId ?? currentItem.categoryId;
  if (input.categoryId) await assertCategoryExists(db, input.categoryId);
  await assertUniqueItemName(db, name, itemId);

  const [updatedItem] = await db
    .update(menuItems)
    .set({
      categoryId,
      name,
      priceCents,
      description: input.description === undefined ? currentItem.description : normalizeOptionalText(input.description),
      sku: input.sku === undefined ? currentItem.sku : normalizeOptionalText(input.sku),
      prepStation: input.prepStation === undefined ? currentItem.prepStation : normalizeOptionalText(input.prepStation) || 'Kitchen',
      dietaryTags: input.dietaryTags === undefined ? currentItem.dietaryTags : normalizeOptionalText(input.dietaryTags),
      isAvailable: input.isAvailable ?? currentItem.isAvailable,
      isArchived: input.isArchived ?? currentItem.isArchived
    })
    .where(eq(menuItems.id, itemId))
    .returning();

  if (!updatedItem) throw new Error('MENU_ITEM_UPDATE_FAILED');

  const menu = await listMenu(db, { search: name, availability: updatedItem.isArchived ? 'archived' : 'all' });
  const item = menu.items.find((menuItem) => menuItem.id === updatedItem.id);
  if (!item) throw new Error('MENU_ITEM_UPDATE_FAILED');
  return item;
}
