import type { GetSettings200, GetSettings200Settings } from '@ody/api-client';

export const timezoneOptions = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'] as const;
export const currencyOptions = ['USD', 'CAD', 'GBP', 'EUR'] as const;

export type TimezoneOption = typeof timezoneOptions[number];
export type CurrencyOption = typeof currencyOptions[number];

/**
 * Description: Implements getSettingsData.
 * Parameters: data unknown generated API response.
 * Returns: GetSettings200 or null when the response is not successful.
 */
export function getSettingsData(data: unknown) {
  const response = data as { status?: number; data?: GetSettings200 } | undefined;
  return response?.status === 200 && response.data ? response.data : null;
}

/**
 * Description: Implements formatUpdatedAt.
 * Parameters: value string ISO updated timestamp.
 * Returns: string formatted timestamp.
 */
export function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

/**
 * Description: Implements cloneSettings.
 * Parameters: settings GetSettings200Settings generated settings payload.
 * Returns: GetSettings200Settings cloned editable settings payload.
 */
export function cloneSettings(settings: GetSettings200Settings) {
  return { ...settings };
}

/**
 * Description: Implements getSettingsErrorMessage.
 * Parameters: error unknown generated API error.
 * Returns: string user-facing error message.
 */
export function getSettingsErrorMessage(error: unknown) {
  const response = error as { error?: { message?: string } } | undefined;
  return response?.error?.message ?? 'Settings could not be saved.';
}

/**
 * Description: Implements isDirtySettings.
 * Parameters: current GetSettings200Settings or null editable settings, saved GetSettings200Settings or null persisted settings.
 * Returns: boolean indicating whether form values differ from persisted settings.
 */
export function isDirtySettings(current: GetSettings200Settings | null, saved: GetSettings200Settings | null) {
  if (!current || !saved) return false;
  return JSON.stringify(current) !== JSON.stringify(saved);
}
