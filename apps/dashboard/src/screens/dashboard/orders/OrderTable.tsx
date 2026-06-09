import type { ListOrders200OrdersItem, PerformOrderActionBodyAction as PerformOrderActionBodyActionType } from '@ody/api-client';
import { Button, colors, componentTokens, EmptyStateCard, radius, spacing, StatusBadge, SurfaceCard, TableCell, typography } from '@ody/shared';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { actionLabels, formatCurrency, formatDateTime, formatStatusLabel, getStatusTone, orderTableColumns } from './order-formatters';

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

export type OrderTableProps = {
  actionOrderId?: string;
  actionPending: boolean;
  onCreateOrder: () => void;
  onSelectOrder: (orderId: string) => void;
  onStatusAction: (orderId: string, action: PerformOrderActionBodyActionType) => void;
  orders: ListOrders200OrdersItem[];
  search: string;
};

/**
 * Description: Implements OrderTableHeader.
 * Parameters: none.
 * Returns: JSX order table header row.
 */
function OrderTableHeader() {
  return (
    <View style={{ minHeight: 44, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md }}>
      <TableCell flex={orderTableColumns.order}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>ORDER</Text></TableCell>
      <TableCell flex={orderTableColumns.customer}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>CUSTOMER</Text></TableCell>
      <TableCell flex={orderTableColumns.items}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>ITEMS</Text></TableCell>
      <TableCell flex={orderTableColumns.type}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>TYPE</Text></TableCell>
      <TableCell flex={orderTableColumns.status}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>STATUS</Text></TableCell>
      <TableCell flex={orderTableColumns.total}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900', textAlign: 'center' }}>TOTAL</Text></TableCell>
      <TableCell flex={orderTableColumns.updated}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900', textAlign: 'center' }}>UPDATED</Text></TableCell>
      <TableCell flex={orderTableColumns.action} align="center"><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900', textAlign: 'center' }}>ACTION</Text></TableCell>
    </View>
  );
}

/**
 * Description: Implements OrderTable.
 * Parameters: props OrderTableProps order rows and action handlers.
 * Returns: JSX order data table with empty state.
 */
export function OrderTable({ actionOrderId, actionPending, onCreateOrder, onSelectOrder, onStatusAction, orders, search }: OrderTableProps) {
  return (
    <SurfaceCard style={{ position: 'relative', zIndex: 1, flex: 1, minHeight: 0, padding: 0, overflow: 'hidden' }}>
      {orders.length ? (
        <View style={{ flex: 1, minHeight: 0 }}>
          <OrderTableHeader />
          <ScrollView style={{ flex: 1 }}>
            {orders.map((order) => {
              const primaryAction = order.availableActions[0];
              const actionLoading = actionPending && actionOrderId === order.id;

              return (
                <View key={order.id} style={{ minHeight: 72, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md }}>
                  <TableCell flex={orderTableColumns.order}><Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{order.orderNumber}</Text></TableCell>
                  <TableCell flex={orderTableColumns.customer}>
                    <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{order.customer.name}</Text>
                    <Text style={{ marginTop: 2, color: colors.text.muted, fontSize: typography.caption.fontSize }}>{order.customer.email}</Text>
                    <Text style={{ marginTop: 2, color: colors.text.muted, fontSize: typography.caption.fontSize }}>{order.customer.phone}</Text>
                  </TableCell>
                  <TableCell flex={orderTableColumns.items}><Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight, textAlign: 'center' }}>{order.itemCount}</Text></TableCell>
                  <TableCell flex={orderTableColumns.type}><Text style={{ color: colors.text.secondary, fontSize: typography.body.fontSize, textTransform: 'capitalize' }}>{order.fulfillmentType}</Text></TableCell>
                  <TableCell flex={orderTableColumns.status}><StatusBadge label={formatStatusLabel(order.status)} tone={getStatusTone(order.status)} /></TableCell>
                  <TableCell flex={orderTableColumns.total}><Text style={{ color: colors.text.primary, fontFamily: componentTokens.data.numericFontFamily, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight, textAlign: 'center' }}>{formatCurrency(order.totalCents)}</Text></TableCell>
                  <TableCell flex={orderTableColumns.updated}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, textAlign: 'center' }}>{formatDateTime(order.updatedAt)}</Text></TableCell>
                  <TableCell flex={orderTableColumns.action} align="center">
                    <View style={{ width: primaryAction ? 202 : 92, flexDirection: 'row', gap: spacing.xs }}>
                      <Pressable accessibilityRole="button" onPress={() => onSelectOrder(order.id)} style={[{ minHeight: 36, flex: 1, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.action.secondary, borderWidth: 1, borderColor: colors.borderColor.default, paddingHorizontal: spacing.md }, pointerStyle]}>
                        <Text style={{ color: colors.action.secondaryText, fontSize: typography.caption.fontSize, fontWeight: '900' }}>View</Text>
                      </Pressable>
                      {primaryAction ? (
                        <Pressable accessibilityRole="button" disabled={actionPending} onPress={() => onStatusAction(order.id, primaryAction)} style={[{ minHeight: 36, flex: 1.25, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.action.primary, paddingHorizontal: spacing.md, opacity: actionPending ? 0.6 : 1 }, pointerStyle]}>
                          {actionLoading ? <ActivityIndicator color={colors.action.primaryText} /> : <Text style={{ color: colors.action.primaryText, fontSize: typography.caption.fontSize, fontWeight: '900' }}>{actionLabels[primaryAction]}</Text>}
                        </Pressable>
                      ) : null}
                    </View>
                  </TableCell>
                </View>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <EmptyStateCard
          icon={search ? 'search' : 'orders'}
          title={search ? "We couldn't find a match" : 'No orders found'}
          description={search ? 'Try searching across all orders.' : 'Create an order to populate this list.'}
          style={{ flex: 1, minHeight: 240, borderWidth: 0, borderRadius: 0 }}
          action={<View style={{ width: 180 }}><Button onPress={onCreateOrder}>{search ? 'Search all orders' : 'Create order'}</Button></View>}
        />
      )}
    </SurfaceCard>
  );
}
