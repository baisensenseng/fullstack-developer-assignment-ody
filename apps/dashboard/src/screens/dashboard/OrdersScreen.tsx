import { useListOrderCreateOptions, useListOrders, usePerformOrderAction, type ListOrders200OrdersItem } from '@ody/api-client';
import { Button, colors, ErrorStateCard, LoadingStateCard, NavigationTabs, spacing, ToastCard, typography, useToast } from '@ody/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { CreateOrderModal } from './orders/CreateOrderModal';
import { OrderDetailModal } from './orders/OrderDetailModal';
import { OrderFilters } from './orders/OrderFilters';
import { OrderTable } from './orders/OrderTable';
import { allOrderStatuses, channelFilterOptions, downloadOrdersCsv, formatDateTime, fulfillmentFilterOptions, getCreateOptionsData, locationFilterOptions, statusFilters, type OrderStatusFilter } from './orders/order-formatters';

/**
 * Description: Implements OrdersScreen.
 * Parameters: none.
 * Returns: JSX orders workspace screen.
 */
export function OrdersScreen() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [status, setStatus] = useState<OrderStatusFilter>(allOrderStatuses);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [listActionError, setListActionError] = useState('');
  const [selectedFulfillmentTypes, setSelectedFulfillmentTypes] = useState<Array<ListOrders200OrdersItem['fulfillmentType']>>(fulfillmentFilterOptions.map((item) => item.value));
  const [selectedChannels, setSelectedChannels] = useState<Array<(typeof channelFilterOptions)[number]['value']>>(channelFilterOptions.map((item) => item.value));
  const [selectedLocations, setSelectedLocations] = useState<Array<(typeof locationFilterOptions)[number]['value']>>(locationFilterOptions.map((item) => item.value));
  const ordersQuery = useListOrders({
    ...(status === allOrderStatuses ? {} : { status }),
    ...(search.trim() ? { search: search.trim() } : {}),
    fulfillmentTypes: selectedFulfillmentTypes.length ? selectedFulfillmentTypes.join(',') : '__none__',
    channel: selectedChannels.length ? selectedChannels.join(',') : '__none__',
    location: selectedLocations.length ? selectedLocations.join(',') : '__none__'
  });
  const optionsQuery = useListOrderCreateOptions();
  const listActionMutation = usePerformOrderAction({
    mutation: {
      onSuccess: async (_result, variables) => {
        setListActionError('');
        showToast({ title: 'Order updated', message: `Order action ${variables.data?.action.replace('_', ' ') ?? 'update'} completed.`, tone: 'success' });
        await queryClient.invalidateQueries({ queryKey: ['/orders'] });
        await queryClient.invalidateQueries({ queryKey: ['/summary'] });
      },
      onError: (error) => {
        const apiError = error as { error?: { message?: string } };
        const message = apiError.error?.message ?? 'This action could not be completed.';
        setListActionError(message);
        showToast({ title: 'Action failed', message, tone: 'error' });
      }
    }
  });
  const orders = ordersQuery.data?.status === 200 ? ordersQuery.data.data.orders : [];
  const options = getCreateOptionsData(optionsQuery.data);

  return (
    <View style={{ position: 'relative', flex: 1, gap: spacing.lg }}>
      <CreateOrderModal open={createOpen} options={options} onClose={() => setCreateOpen(false)} onCreated={setDetailOrderId} />
      <OrderDetailModal orderId={detailOrderId} onClose={() => setDetailOrderId(null)} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.lg }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.pageTitle.fontSize, lineHeight: typography.pageTitle.lineHeight, fontWeight: typography.pageTitle.fontWeight }}>All orders</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ width: 128 }}><Button variant="secondary" onPress={() => { downloadOrdersCsv(orders); showToast({ title: 'Export ready', message: `${orders.length} orders exported to CSV.`, tone: 'success' }); }}>Export</Button></View>
          <View style={{ width: 156 }}><Button onPress={() => setCreateOpen(true)}>Create order</Button></View>
        </View>
      </View>

      <NavigationTabs items={statusFilters} value={status} onChange={setStatus} />
      <OrderFilters
        openFilterId={openFilterId}
        search={search}
        selectedChannels={selectedChannels}
        selectedFulfillmentTypes={selectedFulfillmentTypes}
        selectedLocations={selectedLocations}
        setOpenFilterId={setOpenFilterId}
        setSearch={setSearch}
        setSelectedChannels={setSelectedChannels}
        setSelectedFulfillmentTypes={setSelectedFulfillmentTypes}
        setSelectedLocations={setSelectedLocations}
      />

      <Text style={{ position: 'relative', zIndex: 1, color: colors.text.secondary, fontSize: typography.body.fontSize }}>Last updated: {formatDateTime(new Date().toISOString())}</Text>
      {listActionError ? <ToastCard tone="error" title="Action failed" message={listActionError} /> : null}

      {ordersQuery.isLoading ? <LoadingStateCard label="Loading orders" /> : ordersQuery.isError ? <ErrorStateCard title="Could not load orders" description="Refresh the order queue and try again." onRetry={() => void ordersQuery.refetch()} /> : (
        <OrderTable
          actionOrderId={listActionMutation.variables?.orderId}
          actionPending={listActionMutation.isPending}
          onCreateOrder={() => search ? setSearch('') : setCreateOpen(true)}
          onSelectOrder={setDetailOrderId}
          onStatusAction={(orderId, action) => listActionMutation.mutate({ orderId, data: { action } })}
          orders={orders}
          search={search}
        />
      )}
    </View>
  );
}
