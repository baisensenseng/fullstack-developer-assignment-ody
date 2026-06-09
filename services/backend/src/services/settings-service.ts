import { eq } from 'drizzle-orm';
import { orderingSettings } from '../db/schema';
import type { DbClient } from '../db/client';

export type UpdateSettingsInput = {
  serviceAvailable?: boolean;
  autoAccept?: boolean;
  prepTimeMinutes?: number;
  businessName?: string;
  timezone?: string;
  currency?: string;
  openingHours?: string;
  newOrderAlerts?: boolean;
  lowStockAlerts?: boolean;
  dailyDigest?: boolean;
};

const defaultSettings = {
  serviceAvailable: true,
  autoAccept: false,
  prepTimeMinutes: 20,
  businessName: 'Ody Bistro',
  timezone: 'America/New_York',
  currency: 'USD',
  openingHours: 'Mon-Fri 09:00-21:00; Sat-Sun 10:00-22:00',
  newOrderAlerts: true,
  lowStockAlerts: true,
  dailyDigest: false
} as const;

/**
 * Description: Implements normalizeText.
 * Parameters: value string raw text value, fallback string fallback text.
 * Returns: string normalized text with fallback.
 */
function normalizeText(value: string, fallback: string) {
  const nextValue = value.trim().replace(/\s+/g, ' ');
  return nextValue || fallback;
}

/**
 * Description: Implements mapSettings.
 * Parameters: settings ordering settings row.
 * Returns: normalized settings payload.
 */
function mapSettings(settings: typeof orderingSettings.$inferSelect) {
  return {
    id: settings.id,
    serviceAvailable: settings.serviceAvailable,
    autoAccept: settings.autoAccept,
    prepTimeMinutes: settings.prepTimeMinutes,
    businessName: settings.businessName,
    timezone: settings.timezone,
    currency: settings.currency,
    openingHours: settings.openingHours,
    newOrderAlerts: settings.newOrderAlerts,
    lowStockAlerts: settings.lowStockAlerts,
    dailyDigest: settings.dailyDigest,
    updatedAt: settings.updatedAt.toISOString()
  };
}

/**
 * Description: Implements getOrCreateSettingsRow.
 * Parameters: db DbClient database client.
 * Returns: Promise containing the persisted settings row.
 */
async function getOrCreateSettingsRow(db: DbClient) {
  const [existingSettings] = await db.select().from(orderingSettings).limit(1);
  if (existingSettings) return existingSettings;
  const [createdSettings] = await db.insert(orderingSettings).values(defaultSettings).returning();
  if (!createdSettings) throw new Error('SETTINGS_CREATE_FAILED');
  return createdSettings;
}

/**
 * Description: Implements getSettings.
 * Parameters: db DbClient database client.
 * Returns: Promise containing current settings.
 */
export async function getSettings(db: DbClient) {
  return mapSettings(await getOrCreateSettingsRow(db));
}

/**
 * Description: Implements updateSettings.
 * Parameters: db DbClient database client, input UpdateSettingsInput settings patch.
 * Returns: Promise containing updated settings.
 */
export async function updateSettings(db: DbClient, input: UpdateSettingsInput) {
  const currentSettings = await getOrCreateSettingsRow(db);
  const prepTimeMinutes = input.prepTimeMinutes ?? currentSettings.prepTimeMinutes;
  if (!Number.isInteger(prepTimeMinutes) || prepTimeMinutes < 5 || prepTimeMinutes > 180) throw new Error('INVALID_PREP_TIME');

  const [updatedSettings] = await db.update(orderingSettings).set({
    serviceAvailable: input.serviceAvailable ?? currentSettings.serviceAvailable,
    autoAccept: input.autoAccept ?? currentSettings.autoAccept,
    prepTimeMinutes,
    businessName: input.businessName === undefined ? currentSettings.businessName : normalizeText(input.businessName, currentSettings.businessName),
    timezone: input.timezone === undefined ? currentSettings.timezone : normalizeText(input.timezone, currentSettings.timezone),
    currency: input.currency === undefined ? currentSettings.currency : normalizeText(input.currency, currentSettings.currency).toUpperCase().slice(0, 3),
    openingHours: input.openingHours === undefined ? currentSettings.openingHours : normalizeText(input.openingHours, currentSettings.openingHours),
    newOrderAlerts: input.newOrderAlerts ?? currentSettings.newOrderAlerts,
    lowStockAlerts: input.lowStockAlerts ?? currentSettings.lowStockAlerts,
    dailyDigest: input.dailyDigest ?? currentSettings.dailyDigest,
    updatedAt: new Date()
  }).where(eq(orderingSettings.id, currentSettings.id)).returning();

  if (!updatedSettings) throw new Error('SETTINGS_UPDATE_FAILED');
  return mapSettings(updatedSettings);
}
