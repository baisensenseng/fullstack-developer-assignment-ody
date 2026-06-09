import { ListOrdersStatus, type ListOrderCreateOptions200, type ListOrders200OrdersItem, type ListOrdersStatus as ListOrdersStatusType, type PerformOrderActionBodyAction as PerformOrderActionBodyActionType } from '@ody/api-client';
import type { StatusBadgeTone } from '@ody/shared';

export const allOrderStatuses = 'all';
export type OrderStatusFilter = ListOrdersStatusType | typeof allOrderStatuses;

export const statusFilters: Array<{ label: string; value: OrderStatusFilter }> = [
  { label: 'All', value: allOrderStatuses },
  { label: 'Pending', value: ListOrdersStatus.pending },
  { label: 'Accepted', value: ListOrdersStatus.accepted },
  { label: 'Preparing', value: ListOrdersStatus.preparing },
  { label: 'Ready', value: ListOrdersStatus.ready },
  { label: 'Completed', value: ListOrdersStatus.completed },
  { label: 'Cancelled', value: ListOrdersStatus.cancelled }
];

export const fulfillmentFilterOptions: Array<{ label: string; value: ListOrders200OrdersItem['fulfillmentType'] }> = [
  { label: 'Pickup', value: 'pickup' },
  { label: 'Delivery', value: 'delivery' },
  { label: 'Dine in', value: 'dine-in' }
];

export const channelFilterOptions = [{ label: 'Dashboard', value: 'dashboard' }] as const;
export const locationFilterOptions = [{ label: 'Ody Bistro', value: 'ody-bistro' }] as const;

export const actionLabels: Record<PerformOrderActionBodyActionType, string> = {
  accept: 'Accept',
  start_preparing: 'Start preparing',
  mark_ready: 'Mark ready',
  complete: 'Complete',
  cancel: 'Cancel'
};

export const orderTableColumns = {
  order: 1.1,
  customer: 1.2,
  items: 0.6,
  type: 0.8,
  status: 0.9,
  total: 0.8,
  updated: 1,
  action: 1.5
} as const;

/**
 * Description: Implements formatCurrency.
 * Parameters: cents number amount in cents.
 * Returns: string formatted USD amount.
 */
export function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

/**
 * Description: Implements formatDateTime.
 * Parameters: value string date value.
 * Returns: string formatted date and time.
 */
export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

/**
 * Description: Implements formatStatusLabel.
 * Parameters: status string status value.
 * Returns: string readable status label.
 */
export function formatStatusLabel(status: string) {
  return status.replace('_', ' ');
}

/**
 * Description: Implements getStatusTone.
 * Parameters: status string order status value.
 * Returns: StatusBadgeTone badge tone.
 */
export function getStatusTone(status: string): StatusBadgeTone {
  if (status === 'completed' || status === 'ready') return 'success';
  if (status === 'cancelled') return 'error';
  return 'warning';
}

/**
 * Description: Implements escapeCsvCell.
 * Parameters: value unknown CSV cell value.
 * Returns: string escaped CSV cell.
 */
export function escapeCsvCell(value: unknown) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Description: Implements buildOrdersCsv.
 * Parameters: orders array order rows from list response.
 * Returns: string CSV document for the provided orders.
 */
export function buildOrdersCsv(orders: ListOrders200OrdersItem[]) {
  const header = ['Order', 'Customer', 'Email', 'Phone', 'Items', 'Type', 'Status', 'Total', 'Updated'];
  const rows = orders.map((order) => [order.orderNumber, order.customer.name, order.customer.email, order.customer.phone, order.itemCount, order.fulfillmentType, order.status, formatCurrency(order.totalCents), formatDateTime(order.updatedAt)]);
  return [header, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

/**
 * Description: Implements downloadOrdersCsv.
 * Parameters: orders array order rows from list response.
 * Returns: void after triggering a browser download when available.
 */
export function downloadOrdersCsv(orders: ListOrders200OrdersItem[]) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([buildOrdersCsv(orders)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `ody-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * Description: Implements matchesCustomerQuery.
 * Parameters: customer ListOrderCreateOptions200 customer option, query string search value.
 * Returns: boolean indicating whether customer matches query.
 */
export function matchesCustomerQuery(customer: ListOrderCreateOptions200['customers'][number], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(normalizedQuery);
}

/**
 * Description: Implements getCreateOptionsData.
 * Parameters: data unknown generated API response.
 * Returns: ListOrderCreateOptions200 or null.
 */
export function getCreateOptionsData(data: unknown) {
  const response = data as { status?: number; data?: ListOrderCreateOptions200 } | undefined;
  return response?.status === 200 && response.data ? response.data : null;
}

/**
 * Description: Implements toggleFilterValue.
 * Parameters: values array current values, value selected value, setter function state setter.
 * Returns: void after toggling selected filter value.
 */
export function toggleFilterValue<TValue extends string>(values: TValue[], value: TValue, setter: (values: TValue[]) => void) {
  setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
}
