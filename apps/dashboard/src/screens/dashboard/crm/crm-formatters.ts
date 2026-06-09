import type { GetCustomerById200, ListCustomers200 } from '@ody/api-client';

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
 * Parameters: value string nullable ISO date value.
 * Returns: string formatted date or fallback text.
 */
export function formatDate(value: string | null) {
  if (!value) return 'No orders';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

/**
 * Description: Implements formatDateTime.
 * Parameters: value string ISO date value.
 * Returns: string formatted date and time.
 */
export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

/**
 * Description: Implements getCustomersData.
 * Parameters: data unknown generated API response.
 * Returns: ListCustomers200 or null when the response is not successful.
 */
export function getCustomersData(data: unknown) {
  const response = data as { status?: number; data?: ListCustomers200 } | undefined;
  return response?.status === 200 && response.data ? response.data : null;
}

/**
 * Description: Implements getCustomerDetailData.
 * Parameters: data unknown generated API response.
 * Returns: GetCustomerById200 or null when the response is not successful.
 */
export function getCustomerDetailData(data: unknown) {
  const response = data as { status?: number; data?: GetCustomerById200 } | undefined;
  return response?.status === 200 && response.data ? response.data : null;
}

/**
 * Description: Implements getStatusTone.
 * Parameters: status string order status.
 * Returns: object containing badge label and semantic tone.
 */
export function getStatusTone(status: string) {
  if (status === 'completed' || status === 'ready') return { label: status.replace('_', ' '), tone: 'success' as const };
  if (status === 'cancelled') return { label: 'cancelled', tone: 'error' as const };
  return { label: status.replace('_', ' '), tone: 'warning' as const };
}

/**
 * Description: Implements escapeCsvCell.
 * Parameters: value unknown CSV cell value.
 * Returns: string escaped CSV cell.
 */
function escapeCsvCell(value: unknown) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Description: Implements buildCustomersCsv.
 * Parameters: customers array CRM customer rows.
 * Returns: string CSV document for the provided customer rows.
 */
export function buildCustomersCsv(customers: ListCustomers200['customers']) {
  const header = ['Name', 'Email', 'Phone', 'Tags', 'Notes', 'Orders', 'Spend', 'Last Order'];
  const rows = customers.map((customer) => [customer.name, customer.email, customer.phone, customer.tags, customer.notes, customer.orderCount, formatCurrency(customer.totalSpendCents), formatDate(customer.lastOrderAt)]);
  return [header, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

/**
 * Description: Implements downloadCustomersCsv.
 * Parameters: customers array CRM customer rows.
 * Returns: void after triggering a browser download when available.
 */
export function downloadCustomersCsv(customers: ListCustomers200['customers']) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([buildCustomersCsv(customers)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `ody-customers-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
