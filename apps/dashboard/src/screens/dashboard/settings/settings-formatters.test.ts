import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { cloneSettings, isDirtySettings } from './settings-formatters';

const savedSettings = {
  id: 'settings-id',
  serviceAvailable: true,
  autoAccept: false,
  prepTimeMinutes: 24,
  businessName: 'Ody Bistro',
  timezone: 'America/New_York',
  currency: 'USD',
  openingHours: 'Mon-Fri 09:00-21:00; Sat-Sun 10:00-22:00',
  newOrderAlerts: true,
  lowStockAlerts: true,
  dailyDigest: false,
  updatedAt: '2026-06-09T10:00:00.000Z'
};

describe('settings formatters', () => {
  test('detects dirty settings only when values change', () => {
    assert.equal(isDirtySettings(null, savedSettings), false);
    assert.equal(isDirtySettings(savedSettings, null), false);
    assert.equal(isDirtySettings(cloneSettings(savedSettings), savedSettings), false);
    assert.equal(isDirtySettings({ ...savedSettings, prepTimeMinutes: 30 }, savedSettings), true);
  });

  test('clones settings for editable form state', () => {
    const clone = cloneSettings(savedSettings);
    assert.deepEqual(clone, savedSettings);
    assert.notEqual(clone, savedSettings);
  });
});
