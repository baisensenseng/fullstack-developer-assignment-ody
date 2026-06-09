import type { ListCustomers200CustomersItem } from '@ody/api-client';
import { Button, colors, componentTokens, spacing, SurfaceCard, TableCell, typography } from '@ody/shared';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { formatCurrency, formatDate } from './crm-formatters';

const customerTableColumns = {
  customer: 1.5,
  contact: 1.4,
  orders: 0.7,
  spend: 0.8,
  lastOrder: 0.9,
  action: 1.1
} as const;

export type CustomerTableProps = {
  customers: ListCustomers200CustomersItem[];
  onEdit: (customer: ListCustomers200CustomersItem) => void;
  onSelect: (customerId: string) => void;
  refreshing: boolean;
};

/**
 * Description: Implements CustomerTableHeader.
 * Parameters: none.
 * Returns: JSX CRM customer table header row.
 */
function CustomerTableHeader() {
  return (
    <View style={{ minHeight: 44, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md }}>
      <TableCell flex={customerTableColumns.customer}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>CUSTOMER</Text></TableCell>
      <TableCell flex={customerTableColumns.contact}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>CONTACT</Text></TableCell>
      <TableCell flex={customerTableColumns.orders}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>ORDERS</Text></TableCell>
      <TableCell flex={customerTableColumns.spend}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>SPEND</Text></TableCell>
      <TableCell flex={customerTableColumns.lastOrder}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>LAST ORDER</Text></TableCell>
      <TableCell flex={customerTableColumns.action}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>ACTION</Text></TableCell>
    </View>
  );
}

/**
 * Description: Implements CustomerTableRow.
 * Parameters: customer ListCustomers200CustomersItem row, onEdit function edit handler, onSelect function detail handler.
 * Returns: JSX CRM customer table row.
 */
function CustomerTableRow({ customer, onEdit, onSelect }: { customer: ListCustomers200CustomersItem; onEdit: (customer: ListCustomers200CustomersItem) => void; onSelect: (customerId: string) => void }) {
  return (
    <View style={{ minHeight: 74, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md }}>
      <TableCell flex={customerTableColumns.customer}>
        <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight, textAlign: 'center' }}>{customer.name}</Text>
        <Text style={{ marginTop: 2, color: colors.text.muted, fontSize: typography.caption.fontSize, textAlign: 'center' }}>Since {formatDate(customer.createdAt)}</Text>
      </TableCell>
      <TableCell flex={customerTableColumns.contact}>
        <Text style={{ color: colors.text.primary, fontSize: typography.body.fontSize, fontWeight: '700', textAlign: 'center' }}>{customer.email}</Text>
        <Text style={{ marginTop: 2, color: colors.text.muted, fontSize: typography.caption.fontSize, textAlign: 'center' }}>{customer.phone}</Text>
      </TableCell>
      <TableCell flex={customerTableColumns.orders}><Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight, textAlign: 'center' }}>{customer.orderCount}</Text></TableCell>
      <TableCell flex={customerTableColumns.spend}><Text style={{ color: colors.text.primary, fontFamily: componentTokens.data.numericFontFamily, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight, textAlign: 'center' }}>{formatCurrency(customer.totalSpendCents)}</Text></TableCell>
      <TableCell flex={customerTableColumns.lastOrder}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, textAlign: 'center' }}>{formatDate(customer.lastOrderAt)}</Text></TableCell>
      <TableCell flex={customerTableColumns.action}>
        <View style={{ width: 172, flexDirection: 'row', gap: spacing.xs }}>
          <View style={{ flex: 1 }}><Button variant="secondary" textNumberOfLines={1} onPress={() => onSelect(customer.id)}>View</Button></View>
          <View style={{ flex: 1 }}><Button variant="secondary" textNumberOfLines={1} onPress={() => onEdit(customer)}>Edit</Button></View>
        </View>
      </TableCell>
    </View>
  );
}

/**
 * Description: Implements CustomerTable.
 * Parameters: props CustomerTableProps customer rows, edit/detail handlers, refresh state.
 * Returns: JSX customer table.
 */
export function CustomerTable({ customers, onEdit, onSelect, refreshing }: CustomerTableProps) {
  return (
    <SurfaceCard style={{ flex: 1, minHeight: 0, padding: 0, overflow: 'hidden' }}>
      <CustomerTableHeader />
      <View style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <ScrollView style={{ flex: 1 }}>
          {customers.map((customer) => <CustomerTableRow key={customer.id} customer={customer} onEdit={onEdit} onSelect={onSelect} />)}
        </ScrollView>
        {refreshing ? (
          <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.58)' }}>
            <ActivityIndicator color={colors.text.primary} />
          </View>
        ) : null}
      </View>
    </SurfaceCard>
  );
}
