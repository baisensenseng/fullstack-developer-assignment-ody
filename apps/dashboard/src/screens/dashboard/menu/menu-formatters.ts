/**
 * Description: Implements formatCurrency.
 * Parameters: cents number value in cents.
 * Returns: string formatted USD amount.
 */
export function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

/**
 * Description: Implements formatDate.
 * Parameters: value string ISO date value.
 * Returns: string formatted date.
 */
export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

/**
 * Description: Implements parsePriceToCents.
 * Parameters: value string price input.
 * Returns: number price converted to cents.
 */
export function parsePriceToCents(value: string) {
  const normalized = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(normalized)) return 0;
  return Math.round(normalized * 100);
}

/**
 * Description: Implements centsToPriceInput.
 * Parameters: cents number price in cents.
 * Returns: string price suitable for the input field.
 */
export function centsToPriceInput(cents: number) {
  return (cents / 100).toFixed(2);
}

/**
 * Description: Implements getApiErrorMessage.
 * Parameters: error unknown mutation error.
 * Returns: string display message.
 */
export function getApiErrorMessage(error: unknown) {
  const apiError = error as { error?: { message?: string } };
  return apiError.error?.message ?? 'The request could not be completed.';
}
