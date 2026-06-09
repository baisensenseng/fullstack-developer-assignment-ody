import { Button, colors, componentTokens, EmptyStateCard, radius, spacing, StatusBadge, TableCell, typography } from '@ody/shared';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import type { ListMenu200ItemsItem } from '@ody/api-client';
import { formatCurrency, formatDate } from './menu-formatters';

const menuTableColumns = {
  item: 1.6,
  category: 0.9,
  price: 0.7,
  station: 0.9,
  tags: 0.9,
  availability: 0.9,
  created: 0.9,
  action: 1.4
} as const;

export type MenuTableProps = {
  actionItemId?: string;
  items: ListMenu200ItemsItem[];
  loading: boolean;
  onArchiveToggle: (item: ListMenu200ItemsItem) => void;
  onEdit: (item: ListMenu200ItemsItem) => void;
};

/**
 * Description: Implements getItemBadge.
 * Parameters: item ListMenu200ItemsItem menu item row.
 * Returns: object containing badge label and tone.
 */
function getItemBadge(item: ListMenu200ItemsItem) {
  if (item.isArchived) return { label: 'Archived', tone: 'info' as const };
  if (item.isAvailable) return { label: 'Available', tone: 'success' as const };
  return { label: 'Unavailable', tone: 'error' as const };
}

/**
 * Description: Implements MenuTable.
 * Parameters: props MenuTableProps item rows and interaction handlers.
 * Returns: JSX menu items table.
 */
export function MenuTable({ actionItemId, items, loading, onArchiveToggle, onEdit }: MenuTableProps) {
  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <View style={{ minHeight: 44, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md }}>
        <TableCell flex={menuTableColumns.item}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>ITEM</Text></TableCell>
        <TableCell flex={menuTableColumns.category}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>CATEGORY</Text></TableCell>
        <TableCell flex={menuTableColumns.price}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>PRICE</Text></TableCell>
        <TableCell flex={menuTableColumns.station}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>STATION</Text></TableCell>
        <TableCell flex={menuTableColumns.tags}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>TAGS</Text></TableCell>
        <TableCell flex={menuTableColumns.availability}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>STATUS</Text></TableCell>
        <TableCell flex={menuTableColumns.created}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>CREATED</Text></TableCell>
        <TableCell flex={menuTableColumns.action}><Text numberOfLines={1} style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>ACTION</Text></TableCell>
      </View>
      <View style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <ScrollView style={{ flex: 1 }}>
          {items.map((item) => {
            const badge = getItemBadge(item);
            const actionLoading = actionItemId === item.id;

            return (
              <View key={item.id} style={{ minHeight: 82, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md }}>
                <TableCell flex={menuTableColumns.item}>
                  <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight, textAlign: 'center' }}>{item.name}</Text>
                  <Text style={{ marginTop: 2, color: colors.text.muted, fontSize: typography.caption.fontSize, textAlign: 'center' }}>{item.description || item.sku || item.id.slice(0, 8).toUpperCase()}</Text>
                </TableCell>
                <TableCell flex={menuTableColumns.category}><Text style={{ color: colors.text.secondary, fontSize: typography.body.fontSize, fontWeight: '700', textAlign: 'center' }}>{item.categoryName}</Text></TableCell>
                <TableCell flex={menuTableColumns.price}><Text style={{ color: colors.text.primary, fontFamily: componentTokens.data.numericFontFamily, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight, textAlign: 'center' }}>{formatCurrency(item.priceCents)}</Text></TableCell>
                <TableCell flex={menuTableColumns.station}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '800', textAlign: 'center' }}>{item.prepStation}</Text></TableCell>
                <TableCell flex={menuTableColumns.tags}><Text style={{ color: colors.text.muted, fontSize: typography.caption.fontSize, textAlign: 'center' }}>{item.dietaryTags || 'None'}</Text></TableCell>
                <TableCell flex={menuTableColumns.availability}><StatusBadge label={badge.label} tone={badge.tone} /></TableCell>
                <TableCell flex={menuTableColumns.created}><Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, textAlign: 'center' }}>{formatDate(item.createdAt)}</Text></TableCell>
                <TableCell flex={menuTableColumns.action}>
                  <View style={{ width: 188, flexDirection: 'row', gap: spacing.xs }}>
                    <View style={{ flex: 1 }}><Button variant="secondary" disabled={Boolean(actionItemId)} textNumberOfLines={1} onPress={() => onEdit(item)}>Edit</Button></View>
                    <View style={{ flex: 1 }}><Button variant="secondary" loading={actionLoading} disabled={Boolean(actionItemId)} textNumberOfLines={1} onPress={() => onArchiveToggle(item)}>{item.isArchived ? 'Restore' : item.isAvailable ? 'Hide' : 'Show'}</Button></View>
                  </View>
                </TableCell>
              </View>            );
          })}
        </ScrollView>
        {loading ? (
          <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.58)' }}>
            <ActivityIndicator color={colors.text.primary} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Description: Implements MenuTableEmptyState.
 * Parameters: search string current search value, onCreate function create handler, onClearSearch function clear search handler.
 * Returns: JSX menu table empty state.
 */
export function MenuTableEmptyState({ onClearSearch, onCreate, search }: { search: string; onClearSearch: () => void; onCreate: () => void }) {
  return (
    <EmptyStateCard
      icon={search ? 'search' : 'menu'}
      title={search ? "We couldn't find a match" : 'No menu items found'}
      description={search ? 'Clear search or adjust filters to see more items.' : 'Create an item to start managing the menu.'}
      style={{ flex: 1, minHeight: 240, borderWidth: 0, borderRadius: 0 }}
      action={<View style={{ width: 170 }}><Button onPress={search ? onClearSearch : onCreate}>{search ? 'Clear search' : 'Create item'}</Button></View>}
    />
  );
}
