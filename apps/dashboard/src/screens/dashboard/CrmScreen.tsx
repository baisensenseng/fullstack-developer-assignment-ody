import { useCreateCustomer, useListCustomers, useUpdateCustomer, type ListCustomers200CustomersItem } from '@ody/api-client';
import { Button, colors, EmptyStateCard, ErrorStateCard, LoadingStateCard, MetricCard, spacing, SurfaceCard, typography, useToast } from '@ody/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { CustomerDetailDrawer } from './crm/CustomerDetailDrawer';
import { CustomerFormModal, type CustomerFormValues } from './crm/CustomerFormModal';
import { CustomerSearchInput } from './crm/CustomerSearchInput';
import { CustomerTable } from './crm/CustomerTable';
import { downloadCustomersCsv, formatCurrency, getCustomersData } from './crm/crm-formatters';

/**
 * Description: Implements getMutationErrorMessage.
 * Parameters: error unknown generated API error value.
 * Returns: string user-facing error message.
 */
function getMutationErrorMessage(error: unknown) {
  const response = error as { error?: { message?: string } } | undefined;
  return response?.error?.message ?? 'Customer could not be saved.';
}

/**
 * Description: Implements CrmScreen.
 * Parameters: none.
 * Returns: JSX CRM screen.
 */
export function CrmScreen() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<ListCustomers200CustomersItem | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formVisible, setFormVisible] = useState(false);
  const [formError, setFormError] = useState('');
  const customersQuery = useListCustomers(search.trim() ? { search: search.trim() } : {}, { query: { placeholderData: (previousData) => previousData } });
  const createCustomerMutation = useCreateCustomer({ mutation: { onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['/customers'] }); } } });
  const updateCustomerMutation = useUpdateCustomer({ mutation: { onSuccess: async (_data, variables) => { await queryClient.invalidateQueries({ queryKey: ['/customers'] }); await queryClient.invalidateQueries({ queryKey: [`/customers/${variables.customerId}`] }); } } });
  const data = getCustomersData(customersQuery.data);
  const customers = data?.customers ?? [];
  const initialLoading = customersQuery.isLoading && !data;
  const refreshing = customersQuery.isFetching && Boolean(data);
  const saving = createCustomerMutation.isPending || updateCustomerMutation.isPending;

  /**
   * Description: Implements openCreateForm.
   * Parameters: none.
   * Returns: void after opening create customer modal.
   */
  function openCreateForm() {
    setFormMode('create');
    setEditingCustomer(null);
    setFormError('');
    setFormVisible(true);
  }

  /**
   * Description: Implements openEditForm.
   * Parameters: customer ListCustomers200CustomersItem selected customer row.
   * Returns: void after opening edit customer modal.
   */
  function openEditForm(customer: ListCustomers200CustomersItem) {
    setFormMode('edit');
    setEditingCustomer(customer);
    setFormError('');
    setFormVisible(true);
  }

  /**
   * Description: Implements closeForm.
   * Parameters: none.
   * Returns: void after closing customer form modal.
   */
  function closeForm() {
    if (saving) return;
    setFormVisible(false);
    setFormError('');
  }

  /**
   * Description: Implements submitCustomerForm.
   * Parameters: values CustomerFormValues form payload.
   * Returns: Promise<void> after saving customer changes.
   */
  async function submitCustomerForm(values: CustomerFormValues) {
    setFormError('');
    try {
      if (formMode === 'create') {
        const response = await createCustomerMutation.mutateAsync({ data: values });
        if (response.status !== 201) throw response.data;
        showToast({ title: 'Customer created', message: `${response.data.customer.name} was added to CRM.`, tone: 'success' });
      } else if (editingCustomer) {
        const response = await updateCustomerMutation.mutateAsync({ customerId: editingCustomer.id, data: values });
        if (response.status !== 200) throw response.data;
        showToast({ title: 'Customer saved', message: `${response.data.customer.name} was updated.`, tone: 'success' });
      }
      setFormVisible(false);
      setEditingCustomer(null);
    } catch (error) {
      const message = getMutationErrorMessage(error);
      setFormError(message);
      showToast({ title: 'Customer save failed', message, tone: 'error' });
    }
  }

  if (initialLoading) return <LoadingStateCard label="Loading customers" />;
  if (customersQuery.isError || !data) return <ErrorStateCard title="Could not load CRM" description="Refresh customer data and try again." onRetry={() => void customersQuery.refetch()} />;

  return (
    <View style={{ flex: 1, minHeight: 0, gap: spacing.lg }}>
      <CustomerDetailDrawer customerId={selectedCustomerId} onClose={() => setSelectedCustomerId(null)} />
      <CustomerFormModal customer={editingCustomer} error={formError} loading={saving} mode={formMode} visible={formVisible} onClose={closeForm} onSubmit={(values) => void submitCustomerForm(values)} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.lg }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.pageTitle.fontSize, lineHeight: typography.pageTitle.lineHeight, fontWeight: typography.pageTitle.fontWeight }}>CRM</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ width: 150 }}><Button variant="secondary" onPress={() => { downloadCustomersCsv(customers); showToast({ title: 'Export ready', message: `${customers.length} customers exported to CSV.`, tone: 'success' }); }}>Export</Button></View>
          <View style={{ width: 170 }}><Button onPress={openCreateForm}>Create customer</Button></View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        <MetricCard label="Customers" value={String(data.summary.totalCustomers)} helper="Customers in this view" />
        <MetricCard label="Active" value={String(data.summary.activeCustomers)} helper="Customers with orders" />
        <MetricCard label="Revenue" value={formatCurrency(data.summary.totalSpendCents)} helper="Customer lifetime spend" />
        <MetricCard label="Avg. spend" value={formatCurrency(data.summary.averageSpendCents)} helper="Per customer" />
        <MetricCard label="Orders" value={String(data.summary.totalOrders)} helper="Lifetime order count" />
      </View>
      <View style={{ width: 380 }}><CustomerSearchInput value={search} onChangeText={setSearch} onClear={() => setSearch('')} /></View>
      {customers.length ? (
        <CustomerTable customers={customers} refreshing={refreshing} onEdit={openEditForm} onSelect={setSelectedCustomerId} />
      ) : (
        <SurfaceCard>
          <EmptyStateCard
            icon={search ? 'search' : 'customers'}
            title={search ? "We couldn't find a match" : 'No customers found'}
            description={search ? 'Clear search to review all customer records.' : 'Create customers or orders to populate CRM.'}
            style={{ minHeight: 240, borderWidth: 0, borderRadius: 0 }}
            action={search ? <View style={{ width: 150 }}><Button onPress={() => setSearch('')}>Clear search</Button></View> : null}
          />
        </SurfaceCard>
      )}
    </View>
  );
}
