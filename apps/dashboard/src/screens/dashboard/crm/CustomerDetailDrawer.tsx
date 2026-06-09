import { useGetCustomerById, type GetCustomerById200OrdersItem } from '@ody/api-client';
import { colors, componentTokens, EmptyStateCard, ErrorStateCard, MetricCard, radius, spacing, StatusBadge, SurfaceCard, typography } from '@ody/shared';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { formatCurrency, formatDate, formatDateTime, getCustomerDetailData, getStatusTone } from './crm-formatters';

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

export type CustomerDetailDrawerProps = {
  customerId: string | null;
  onClose: () => void;
};

/**
 * Description: Implements getFavoriteFulfillment.
 * Parameters: orders array customer order rows.
 * Returns: string most common fulfillment type or fallback text.
 */
function getFavoriteFulfillment(orders: GetCustomerById200OrdersItem[]) {
  if (!orders.length) return 'No orders';
  const counts = orders.reduce<Record<string, number>>((nextCounts, order) => ({ ...nextCounts, [order.fulfillmentType]: (nextCounts[order.fulfillmentType] ?? 0) + 1 }), {});
  return Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'No orders';
}

/**
 * Description: Implements CustomerDetailDrawer.
 * Parameters: props CustomerDetailDrawerProps selected customer identifier and close handler.
 * Returns: JSX customer detail drawer modal.
 */
export function CustomerDetailDrawer({ customerId, onClose }: CustomerDetailDrawerProps) {
  const router = useRouter();
  const detailQuery = useGetCustomerById(customerId ?? '', { query: { enabled: Boolean(customerId) } });
  const detail = getCustomerDetailData(detailQuery.data);

  return (
    <Modal visible={Boolean(customerId)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(16,16,16,0.22)', alignItems: 'flex-end' }}>
        <Pressable accessibilityRole="button" onPress={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
        <View style={{ width: 560, maxWidth: '92%', height: '100%', backgroundColor: colors.background.elevated, padding: spacing.xl }}>
          {detailQuery.isLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.text.primary} /></View>
          ) : detailQuery.isError || !detail ? (
            <ErrorStateCard title="Could not load customer" description="Refresh customer details and try again." onRetry={() => void detailQuery.refetch()} />
          ) : (
            <ScrollView>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text.primary, fontSize: typography.pageTitle.fontSize, lineHeight: typography.pageTitle.lineHeight, fontWeight: typography.pageTitle.fontWeight }}>{detail.customer.name}</Text>
                  <Text style={{ marginTop: spacing.xs, color: colors.text.secondary, fontSize: typography.body.fontSize }}>{detail.customer.email} · {detail.customer.phone}</Text>
                </View>
                <Pressable accessibilityRole="button" onPress={onClose} style={[{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted }, pointerStyle]}>
                  <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '900' }}>×</Text>
                </Pressable>
              </View>
              <View style={{ marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                <MetricCard label="Orders" value={String(detail.customer.orderCount)} helper="Lifetime orders" />
                <MetricCard label="Spend" value={formatCurrency(detail.customer.totalSpendCents)} helper="Excludes cancelled orders" />
                <MetricCard label="Avg. order" value={formatCurrency(detail.customer.averageOrderValueCents)} helper="Average ticket" />
              </View>
              <View style={{ marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                <MetricCard label="Last order" value={formatDate(detail.customer.lastOrderAt)} helper="Most recent activity" />
                <MetricCard label="Favorite fulfillment" value={getFavoriteFulfillment(detail.orders)} helper="Most common channel" />
                <MetricCard label="Lifetime spend" value={formatCurrency(detail.customer.totalSpendCents)} helper="Customer value" />
              </View>
              <SurfaceCard style={{ marginTop: spacing.lg }}>
                <Text style={{ color: colors.text.primary, fontSize: typography.cardTitle.fontSize, fontWeight: typography.cardTitle.fontWeight }}>Profile notes</Text>
                <Text style={{ marginTop: spacing.sm, color: colors.text.secondary, fontSize: typography.body.fontSize }}>{detail.customer.notes || 'No notes yet.'}</Text>
                <View style={{ marginTop: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {(detail.customer.tags ? detail.customer.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : ['Untagged']).map((tag) => <View key={tag} style={{ borderRadius: radius.pill, backgroundColor: colors.background.muted, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '800' }}>{tag}</Text></View>)}
                </View>
              </SurfaceCard>
              <SurfaceCard style={{ marginTop: spacing.lg }}>
                <Text style={{ color: colors.text.primary, fontSize: typography.cardTitle.fontSize, fontWeight: typography.cardTitle.fontWeight }}>Recent orders</Text>
                <View style={{ marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderColor.subtle }}>
                  {detail.orders.length ? detail.orders.map((order) => {
                    const badge = getStatusTone(order.status);
                    return (
                      <Pressable key={order.id} accessibilityRole="button" onPress={() => { onClose(); router.push('/orders'); }} style={[{ minHeight: 68, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }, pointerStyle]}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{order.orderNumber}</Text>
                          <Text style={{ marginTop: 2, color: colors.text.muted, fontSize: typography.caption.fontSize }}>{order.fulfillmentType} · {order.itemCount} items · {formatDateTime(order.createdAt)}</Text>
                        </View>
                        <Text style={{ color: colors.text.primary, fontFamily: componentTokens.data.numericFontFamily, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{formatCurrency(order.totalCents)}</Text>
                        <StatusBadge label={badge.label} tone={badge.tone} />
                      </Pressable>
                    );
                  }) : (
                    <EmptyStateCard compact icon="orders" title="No orders yet" description="Orders for this customer will appear here." style={{ minHeight: 140, borderWidth: 0, borderRadius: 0 }} />
                  )}
                </View>
              </SurfaceCard>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
