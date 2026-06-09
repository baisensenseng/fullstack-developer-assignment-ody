import { useGetDashboardSummary, type GetDashboardSummary200, type GetDashboardSummary200RecentOrdersItemStatus } from '@ody/api-client';
import { Button, colors, componentTokens, EmptyStateCard, MetricCard, radius, spacing, StatusBadge, SurfaceCard, SurfaceHeader, typography, type StatusBadgeTone } from '@ody/shared';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

const statusLabels: Record<GetDashboardSummary200RecentOrdersItemStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

/**
 * Description: Implements formatCurrency.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

/**
 * Description: Implements formatOrderTime.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function formatOrderTime(value: string) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

/**
 * Description: Implements getStatusTone.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function getStatusTone(status: GetDashboardSummary200RecentOrdersItemStatus): StatusBadgeTone {
  if (status === 'completed' || status === 'ready') return 'success';
  if (status === 'pending' || status === 'accepted' || status === 'preparing') return 'warning';
  return 'error';
}

/**
 * Description: Implements HomeLoadingState.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function HomeLoadingState() {
  return (
    <SurfaceCard style={{ minHeight: 260, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.text.primary} />
      <Text style={{ marginTop: spacing.md, color: colors.text.secondary, fontSize: typography.body.fontSize }}>Loading restaurant activity</Text>
    </SurfaceCard>
  );
}

/**
 * Description: Implements HomeErrorState.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function HomeErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <SurfaceCard style={{ minHeight: 260, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.text.primary, fontSize: typography.sectionTitle.fontSize, fontWeight: typography.sectionTitle.fontWeight }}>Could not load dashboard</Text>
      <Text style={{ marginTop: spacing.sm, color: colors.text.secondary, fontSize: typography.body.fontSize }}>Refresh the summary data and try again.</Text>
      <View style={{ width: 160, marginTop: spacing.lg }}>
        <Button variant="secondary" onPress={onRetry}>Retry</Button>
      </View>
    </SurfaceCard>
  );
}

/**
 * Description: Implements HomeScreen.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function HomeScreen() {
  const router = useRouter();
  const summaryQuery = useGetDashboardSummary();
  const summary = summaryQuery.data?.status === 200 ? summaryQuery.data.data as GetDashboardSummary200 : null;

  if (summaryQuery.isLoading) return <HomeLoadingState />;
  if (summaryQuery.isError || !summary) return <HomeErrorState onRetry={() => void summaryQuery.refetch()} />;

  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        <MetricCard label="Total orders" value={String(summary.totals.totalOrders)} helper="Orders placed today" />
        <MetricCard label="Revenue" value={formatCurrency(summary.totals.revenueCents)} helper="Excludes cancelled orders" />
        <MetricCard label="Pending" value={String(summary.totals.pendingOrders)} helper="Waiting for acceptance" />
        <MetricCard label="Avg. order" value={formatCurrency(summary.totals.averageOrderValueCents)} helper="Average ticket size" />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.lg, alignItems: 'stretch' }}>
        <SurfaceCard style={{ flex: 1.35 }}>
          <SurfaceHeader title="Recent orders" caption="Live queue snapshot for today." />
          <View style={{ marginTop: spacing.lg }}>
            {summary.recentOrders.length ? summary.recentOrders.map((order, index) => (
              <Pressable
                key={order.id}
                accessibilityRole="button"
                onPress={() => router.push('/orders')}
                style={({ pressed }) => [
                  {
                    minHeight: componentTokens.data.rowHeight,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: componentTokens.data.dividerColor,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: spacing.md,
                    backgroundColor: pressed ? colors.background.muted : 'transparent'
                  },
                  pointerStyle
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{order.orderNumber} · {order.customerName}</Text>
                  <Text style={{ marginTop: 3, color: colors.text.muted, fontSize: typography.caption.fontSize }}>{order.fulfillmentType} · {formatOrderTime(order.createdAt)}</Text>
                </View>
                <Text style={{ color: colors.text.primary, fontFamily: componentTokens.data.numericFontFamily, fontSize: typography.body.fontSize, fontWeight: '700' }}>{formatCurrency(order.totalCents)}</Text>
                <StatusBadge label={statusLabels[order.status]} tone={getStatusTone(order.status)} />
              </Pressable>
            )) : <EmptyStateCard icon="orders" title="No orders yet" description="Create an order from the Orders workspace to populate this queue." />}
          </View>
        </SurfaceCard>

        <View style={{ flex: 0.9, gap: spacing.lg }}>
          <SurfaceCard>
            <SurfaceHeader title="Ordering status" caption="Current service controls." />
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text.secondary, fontSize: typography.body.fontSize }}>Online ordering</Text>
                <Text style={{ color: summary.orderingStatus.serviceAvailable ? colors.text.success : colors.text.error, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{summary.orderingStatus.serviceAvailable ? 'Open' : 'Closed'}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text.secondary, fontSize: typography.body.fontSize }}>Auto accept</Text>
                <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{summary.orderingStatus.autoAccept ? 'Enabled' : 'Manual'}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text.secondary, fontSize: typography.body.fontSize }}>Prep time</Text>
                <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{summary.orderingStatus.prepTimeMinutes} min</Text>
              </View>
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SurfaceHeader title="Popular items" caption="Top selling menu items." />
            <View style={{ marginTop: spacing.md, gap: spacing.md }}>
              {summary.popularItems.length ? summary.popularItems.map((item) => (
                <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{item.name}</Text>
                    <Text style={{ marginTop: 3, color: colors.text.muted, fontSize: typography.caption.fontSize }}>{item.categoryName} · {item.quantitySold} sold</Text>
                  </View>
                  <Text style={{ color: colors.text.primary, fontFamily: componentTokens.data.numericFontFamily, fontSize: typography.body.fontSize, fontWeight: '700' }}>{formatCurrency(item.revenueCents)}</Text>
                </View>
              )) : <EmptyStateCard icon="popular" title="No popular items" description="Popular items will appear after orders include menu items." />}
            </View>
          </SurfaceCard>
        </View>
      </View>

      <SurfaceCard style={{ borderRadius: radius.xl, backgroundColor: colors.background.inverse }}>
        <Text style={{ color: colors.text.inverse, fontSize: typography.sectionTitle.fontSize, lineHeight: typography.sectionTitle.lineHeight, fontWeight: typography.sectionTitle.fontWeight }}>Today’s focus</Text>
        <Text style={{ marginTop: spacing.sm, maxWidth: 720, color: colors.palette.gray200, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight }}>
          Keep pending orders moving, review unavailable menu items, and follow up with repeat guests before the dinner rush.
        </Text>
      </SurfaceCard>
    </View>
  );
}
