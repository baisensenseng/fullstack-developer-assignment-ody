import { useCreateMenuItem, useUpdateMenuItem, type CreateMenuItemBody, type ListMenu200CategoriesItem, type ListMenu200ItemsItem, type UpdateMenuItemBody } from '@ody/api-client';
import { Button, colors, radius, SegmentedButton, spacing, TextField, typography, useToast } from '@ody/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { centsToPriceInput, getApiErrorMessage, parsePriceToCents } from './menu-formatters';

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

export type MenuItemFormModalProps = {
  categories: ListMenu200CategoriesItem[];
  item: ListMenu200ItemsItem | null;
  onClose: () => void;
  open: boolean;
};

/**
 * Description: Implements MenuItemFormModal.
 * Parameters: open boolean visible state, categories array category options, item optional item to edit, onClose function close handler.
 * Returns: JSX modal for creating or editing menu items.
 */
export function MenuItemFormModal({ categories, item, onClose, open }: MenuItemFormModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [prepStation, setPrepStation] = useState('Kitchen');
  const [dietaryTags, setDietaryTags] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [feedback, setFeedback] = useState('');
  const createMutation = useCreateMenuItem({
    mutation: {
      onSuccess: async (result) => {
        if (result.status !== 201) return;
        await queryClient.invalidateQueries({ queryKey: ['/menu'] });
        await queryClient.invalidateQueries({ queryKey: ['/orders/create-options'] });
        await queryClient.invalidateQueries({ queryKey: ['/summary'] });
        showToast({ title: 'Item created', message: `${result.data.item.name} was added to the menu.`, tone: 'success' });
        onClose();
      },
      onError: (error) => {
        const message = getApiErrorMessage(error);
        setFeedback(message);
        showToast({ title: 'Menu item failed', message, tone: 'error' });
      }
    }
  });
  const updateMutation = useUpdateMenuItem({
    mutation: {
      onSuccess: async (result) => {
        if (result.status !== 200) return;
        await queryClient.invalidateQueries({ queryKey: ['/menu'] });
        await queryClient.invalidateQueries({ queryKey: ['/orders/create-options'] });
        await queryClient.invalidateQueries({ queryKey: ['/summary'] });
        showToast({ title: 'Item saved', message: `${result.data.item.name} was updated.`, tone: 'success' });
        onClose();
      },
      onError: (error) => {
        const message = getApiErrorMessage(error);
        setFeedback(message);
        showToast({ title: 'Menu item failed', message, tone: 'error' });
      }
    }
  });

  useEffect(() => {
    if (!open) return;
    setName(item?.name ?? '');
    setCategoryId(item?.categoryId ?? categories[0]?.id ?? '');
    setPrice(item ? centsToPriceInput(item.priceCents) : '');
    setDescription(item?.description ?? '');
    setSku(item?.sku ?? '');
    setPrepStation(item?.prepStation ?? 'Kitchen');
    setDietaryTags(item?.dietaryTags ?? '');
    setIsAvailable(item?.isAvailable ?? true);
    setFeedback('');
  }, [categories, item, open]);

  const priceCents = parsePriceToCents(price);
  const saving = createMutation.isPending || updateMutation.isPending;
  const canSave = Boolean(name.trim() && categoryId && priceCents > 0 && prepStation.trim());

  /**
   * Description: Implements submitItem.
   * Parameters: none.
   * Returns: void after dispatching the create or update mutation.
   */
  function submitItem() {
    setFeedback('');
    const payload: CreateMenuItemBody = { name: name.trim(), categoryId, priceCents, description: description.trim(), sku: sku.trim(), prepStation: prepStation.trim(), dietaryTags: dietaryTags.trim(), isAvailable };
    if (item) {
      const patch: UpdateMenuItemBody = payload;
      updateMutation.mutate({ itemId: item.id, data: patch });
      return;
    }
    createMutation.mutate({ data: payload });
  }

  /**
   * Description: Implements archiveItem.
   * Parameters: none.
   * Returns: void after dispatching archive mutation.
   */
  function archiveItem() {
    if (!item) return;
    setFeedback('');
    updateMutation.mutate({ itemId: item.id, data: { isArchived: true, isAvailable: false } });
  }

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(16,16,16,0.22)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <Pressable accessibilityRole="button" onPress={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
        <View style={{ width: 680, maxWidth: '96%', borderRadius: radius.lg, backgroundColor: colors.background.elevated, padding: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md }}>
            <View>
              <Text style={{ color: colors.text.primary, fontSize: typography.sectionTitle.fontSize, fontWeight: typography.sectionTitle.fontWeight }}>{item ? 'Edit item' : 'Create item'}</Text>
              <Text style={{ marginTop: spacing.xs, color: colors.text.secondary, fontSize: typography.body.fontSize }}>{item ? 'Update pricing, prep details, and availability.' : 'Add an item to the restaurant menu.'}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onClose} style={[{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted }, pointerStyle]}>
              <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '900' }}>×</Text>
            </Pressable>
          </View>
          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            <TextField label="Item name" value={name} onChangeText={setName} />
            <TextField label="Description" value={description} onChangeText={setDescription} />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}><TextField label="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" /></View>
              <View style={{ flex: 1 }}><TextField label="SKU" value={sku} onChangeText={setSku} /></View>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}><TextField label="Prep station" value={prepStation} onChangeText={setPrepStation} /></View>
              <View style={{ flex: 1 }}><TextField label="Dietary tags" value={dietaryTags} onChangeText={setDietaryTags} /></View>
            </View>
            <View>
              <Text style={{ marginBottom: spacing.sm, color: colors.text.secondary, fontSize: typography.label.fontSize, fontWeight: typography.label.fontWeight }}>Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {categories.map((category) => <SegmentedButton key={category.id} active={categoryId === category.id} label={category.name} onPress={() => setCategoryId(category.id)} />)}
              </View>
            </View>
            <View>
              <Text style={{ marginBottom: spacing.sm, color: colors.text.secondary, fontSize: typography.label.fontSize, fontWeight: typography.label.fontWeight }}>Availability</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <SegmentedButton active={isAvailable} label="Available" onPress={() => setIsAvailable(true)} />
                <SegmentedButton active={!isAvailable} label="Unavailable" onPress={() => setIsAvailable(false)} />
              </View>
            </View>
          </View>
          {feedback ? <Text style={{ marginTop: spacing.md, color: colors.text.error, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{feedback}</Text> : null}
          <View style={{ marginTop: spacing.xl, flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
            <View style={{ width: 180 }}>{item && !item.isArchived ? <Button variant="secondary" loading={saving} onPress={archiveItem}>Archive item</Button> : null}</View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ width: 130 }}><Button variant="secondary" onPress={onClose}>Cancel</Button></View>
              <View style={{ width: 150 }}><Button disabled={!canSave} loading={saving} onPress={submitItem}>{item ? 'Save item' : 'Create item'}</Button></View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
