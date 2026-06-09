import { PerformOrderActionBodyAction, useGetOrderById, usePerformOrderAction } from '@ody/api-client';
import { Button, colors, componentTokens, DrawerFrame, ErrorStateCard, LoadingStateCard, radius, spacing, StatusBadge, typography, useToast } from '@ody/shared';
import { useQueryClient } from '@tanstack/react-query';
import { Platform, Pressable, Text, View } from 'react-native';
import { actionLabels, formatCurrency, formatStatusLabel, getStatusTone } from './order-formatters';

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

/**
 * Description: Implements LoadingState.
 * Parameters: label string loading message.
 * Returns: JSX loading state.
 */
function LoadingState({ label }: { label: string }) {
  return <LoadingStateCard label={label} />;
}

/**
 * Description: Implements ErrorState.
 * Parameters: onRetry function retry handler.
 * Returns: JSX error state.
 */
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <ErrorStateCard title="Could not load orders" description="Refresh the order queue and try again." onRetry={onRetry} />;
}
/**
 * Description: Implements OrderDetailPanel.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function OrderDetailPanel({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const detailQuery = useGetOrderById(orderId ?? '', { query: { enabled: Boolean(orderId) } });
  const actionMutation = usePerformOrderAction({
    mutation: {
      onSuccess: async (_result, variables) => {
        showToast({ title: 'Order updated', message: `Order action ${variables.data?.action.replace('_', ' ') ?? 'update'} completed.`, tone: 'success' });
        await queryClient.invalidateQueries({ queryKey: ['/orders'] });
        await queryClient.invalidateQueries({ queryKey: [`/orders/${variables.orderId}`] });
        await queryClient.invalidateQueries({ queryKey: ['/summary'] });
      },
      onError: () => showToast({ title: 'Action failed', message: 'This action is not valid for the current status.', tone: 'error' })
    }
  });
  const order = detailQuery.data?.status === 200 ? detailQuery.data.data.order : null;

  if (!orderId) return null;
  if (detailQuery.isLoading) return <LoadingState label="Loading order detail" />;
  if (detailQuery.isError || !order) return <ErrorState onRetry={() => void detailQuery.refetch()} />;

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
        <View>
          <Text style={{ color: colors.text.primary, fontSize: typography.sectionTitle.fontSize, fontWeight: typography.sectionTitle.fontWeight }}>{order.orderNumber}</Text>
          <Text style={{ marginTop: spacing.xs, color: colors.text.secondary, fontSize: typography.body.fontSize }}>{order.customer.name} · {order.fulfillmentType}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <StatusBadge label={formatStatusLabel(order.status)} tone={getStatusTone(order.status)} />
          <Pressable accessibilityRole="button" onPress={onClose} style={[{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted }, pointerStyle]}>
            <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '900' }}>×</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderColor.subtle }}>
        {order.items.map((item) => (
          <View key={item.id} style={{ minHeight: componentTokens.data.rowHeight, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{item.itemName}</Text>
              <Text style={{ marginTop: 2, color: colors.text.muted, fontSize: typography.caption.fontSize }}>{item.quantity} × {formatCurrency(item.unitPriceCents)}</Text>
            </View>
            <Text style={{ color: colors.text.primary, fontFamily: componentTokens.data.numericFontFamily, fontSize: typography.body.fontSize, fontWeight: '800' }}>{formatCurrency(item.lineTotalCents)}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.cardTitle.fontSize, fontWeight: typography.cardTitle.fontWeight }}>Total</Text>
        <Text style={{ color: colors.text.primary, fontSize: typography.metric.fontSize, lineHeight: typography.metric.lineHeight, fontWeight: typography.metric.fontWeight }}>{formatCurrency(order.totalCents)}</Text>
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <Text style={{ marginBottom: spacing.sm, color: colors.text.secondary, fontSize: typography.label.fontSize, fontWeight: typography.label.fontWeight }}>Valid actions</Text>
        {order.availableActions.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {order.availableActions.map((action) => (
              <View key={action} style={{ minWidth: 130 }}>
                <Button
                  variant={action === PerformOrderActionBodyAction.cancel ? 'secondary' : 'primary'}
                  loading={actionMutation.isPending}
                  onPress={() => actionMutation.mutate({ orderId: order.id, data: { action } })}
                >
                  {actionLabels[action]}
                </Button>
              </View>
            ))}
          </View>
        ) : <Text style={{ color: colors.text.muted, fontSize: typography.body.fontSize }}>No actions are available for this terminal status.</Text>}
        {actionMutation.isError ? <Text style={{ marginTop: spacing.md, color: colors.text.error, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>This action is not valid for the current status.</Text> : null}
      </View>
    </View>
  );
}

/**
 * Description: Implements OrderDetailModal.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function OrderDetailModal({ onClose, orderId }: { orderId: string | null; onClose: () => void }) {
  return (
    <DrawerFrame visible={Boolean(orderId)} onClose={onClose}>
      <OrderDetailPanel orderId={orderId} onClose={onClose} />
    </DrawerFrame>
  );
}

