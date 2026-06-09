import {
  ListMenuAvailability,
  useListMenu,
  useUpdateMenuItem,
  type ListMenu200,
  type ListMenu200CategoriesItem,
  type ListMenu200ItemsItem,
  type ListMenuAvailability as ListMenuAvailabilityType
} from '@ody/api-client';
import { Button, colors, ErrorStateCard, LoadingStateCard, MetricCard, spacing, SurfaceCard, typography, useToast } from '@ody/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { CategoryRail, MenuFilters } from './menu/MenuFilters';
import { MenuCategoryModal } from './menu/MenuCategoryModal';
import { MenuItemFormModal } from './menu/MenuItemFormModal';
import { getApiErrorMessage } from './menu/menu-formatters';
import { MenuTable, MenuTableEmptyState } from './menu/MenuTable';

/**
 * Description: Implements getMenuData.
 * Parameters: data unknown generated API response.
 * Returns: ListMenu200 or null when the response is not successful.
 */
function getMenuData(data: unknown) {
  const response = data as { status?: number; data?: ListMenu200 } | undefined;
  return response?.status === 200 && response.data ? response.data : null;
}

/**
 * Description: Implements MenuScreen.
 * Parameters: none.
 * Returns: JSX menu management screen.
 */
export function MenuScreen() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [availability, setAvailability] = useState<ListMenuAvailabilityType>(ListMenuAvailability.all);
  const [editingItem, setEditingItem] = useState<ListMenu200ItemsItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<ListMenu200CategoriesItem | null>(null);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const menuQuery = useListMenu({
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(categoryId ? { categoryId } : {}),
    availability
  }, { query: { placeholderData: (previousData) => previousData } });
  const updateMutation = useUpdateMenuItem({
    mutation: {
      onSuccess: async () => {
        setActionError('');
        showToast({ title: 'Menu updated', message: 'Item availability was updated.', tone: 'success' });
        await queryClient.invalidateQueries({ queryKey: ['/menu'] });
        await queryClient.invalidateQueries({ queryKey: ['/orders/create-options'] });
        await queryClient.invalidateQueries({ queryKey: ['/summary'] });
      },
      onError: (error) => {
        const message = getApiErrorMessage(error);
        setActionError(message);
        showToast({ title: 'Menu update failed', message, tone: 'error' });
      }
    }
  });
  const menu = getMenuData(menuQuery.data);
  const items = menu?.items ?? [];
  const initialLoading = menuQuery.isLoading && !menu;
  const listRefreshing = menuQuery.isFetching && Boolean(menu);

  /**
   * Description: Implements openCreateItemForm.
   * Parameters: none.
   * Returns: void after opening the create item form.
   */
  function openCreateItemForm() {
    setEditingItem(null);
    setItemFormOpen(true);
  }

  /**
   * Description: Implements openCreateCategoryForm.
   * Parameters: none.
   * Returns: void after opening the create category form.
   */
  function openCreateCategoryForm() {
    setEditingCategory(null);
    setCategoryFormOpen(true);
  }

  /**
   * Description: Implements openEditCategoryForm.
   * Parameters: category ListMenu200CategoriesItem selected category.
   * Returns: void after opening the edit category form.
   */
  function openEditCategoryForm(category: ListMenu200CategoriesItem) {
    setEditingCategory(category);
    setCategoryFormOpen(true);
  }

  /**
   * Description: Implements openEditItemForm.
   * Parameters: item ListMenu200ItemsItem selected item.
   * Returns: void after opening the edit item form.
   */
  function openEditItemForm(item: ListMenu200ItemsItem) {
    setEditingItem(item);
    setItemFormOpen(true);
  }

  /**
   * Description: Implements toggleItemState.
   * Parameters: item ListMenu200ItemsItem selected item.
   * Returns: void after dispatching the item status update.
   */
  function toggleItemState(item: ListMenu200ItemsItem) {
    if (item.isArchived) {
      updateMutation.mutate({ itemId: item.id, data: { isArchived: false, isAvailable: false } });
      return;
    }
    updateMutation.mutate({ itemId: item.id, data: { isAvailable: !item.isAvailable } });
  }

  return (
    <View style={{ flex: 1, minHeight: 0, gap: spacing.lg }}>
      <MenuItemFormModal open={itemFormOpen} categories={menu?.categories ?? []} item={editingItem} onClose={() => setItemFormOpen(false)} />
      <MenuCategoryModal open={categoryFormOpen} category={editingCategory} onClose={() => setCategoryFormOpen(false)} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.lg }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.pageTitle.fontSize, lineHeight: typography.pageTitle.lineHeight, fontWeight: typography.pageTitle.fontWeight }}>Menu</Text>
        <View style={{ width: 150 }}><Button disabled={!menu?.categories.length} onPress={openCreateItemForm}>Create item</Button></View>
      </View>

      {initialLoading ? <LoadingStateCard label="Loading menu" /> : menuQuery.isError || !menu ? <ErrorStateCard title="Could not load menu" description="Refresh menu data and try again." onRetry={() => void menuQuery.refetch()} /> : (
        <View style={{ flex: 1, minHeight: 0, gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            <MetricCard label="Total items" value={String(menu.summary.totalItems)} helper="Items in the current view" />
            <MetricCard label="Available" value={String(menu.summary.availableItems)} helper="Visible to order creation" />
            <MetricCard label="Unavailable" value={String(menu.summary.unavailableItems)} helper="Hidden from new orders" />
            <MetricCard label="Archived" value={String(menu.summary.archivedItems)} helper="Removed from active menus" />
            <MetricCard label="Categories" value={String(menu.summary.categoryCount)} helper="Menu groups in use" />
          </View>

          <MenuFilters search={search} availability={availability} onSearchChange={setSearch} onSearchClear={() => setSearch('')} onAvailabilityChange={setAvailability} />
          {actionError ? <Text style={{ color: colors.text.error, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{actionError}</Text> : null}

          <View style={{ flex: 1, minHeight: 0, flexDirection: 'row', gap: spacing.lg }}>
            <CategoryRail categories={menu.categories} selectedCategoryId={categoryId} onSelect={setCategoryId} onCreateCategory={openCreateCategoryForm} onEditCategory={openEditCategoryForm} />
            <SurfaceCard style={{ flex: 1, minWidth: 0, minHeight: 0, padding: 0, overflow: 'hidden' }}>
              {items.length ? (
                <MenuTable items={items} loading={listRefreshing} actionItemId={updateMutation.isPending ? updateMutation.variables?.itemId : undefined} onEdit={openEditItemForm} onArchiveToggle={toggleItemState} />
              ) : (
                <MenuTableEmptyState search={search} onClearSearch={() => setSearch('')} onCreate={openCreateItemForm} />
              )}
            </SurfaceCard>
          </View>
        </View>
      )}
    </View>
  );
}
