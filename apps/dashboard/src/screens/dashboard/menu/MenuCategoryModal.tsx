import { useCreateMenuCategory, useUpdateMenuCategory, type ListMenu200CategoriesItem } from '@ody/api-client';
import { Button, colors, radius, spacing, TextField, typography, useToast } from '@ody/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { getApiErrorMessage } from './menu-formatters';

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

export type MenuCategoryModalProps = {
  category: ListMenu200CategoriesItem | null;
  onClose: () => void;
  open: boolean;
};

/**
 * Description: Implements MenuCategoryModal.
 * Parameters: open boolean visible state, category optional category to edit, onClose function close handler.
 * Returns: JSX category create and edit modal.
 */
export function MenuCategoryModal({ category, onClose, open }: MenuCategoryModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [feedback, setFeedback] = useState('');
  const createMutation = useCreateMenuCategory({
    mutation: {
      onSuccess: async (result) => {
        if (result.status !== 201) return;
        await queryClient.invalidateQueries({ queryKey: ['/menu'] });
        showToast({ title: 'Category created', message: `${result.data.category.name} was added to the menu.`, tone: 'success' });
        onClose();
      },
      onError: (error) => {
        const message = getApiErrorMessage(error);
        setFeedback(message);
        showToast({ title: 'Category failed', message, tone: 'error' });
      }
    }
  });
  const updateMutation = useUpdateMenuCategory({
    mutation: {
      onSuccess: async (result) => {
        if (result.status !== 200) return;
        await queryClient.invalidateQueries({ queryKey: ['/menu'] });
        await queryClient.invalidateQueries({ queryKey: ['/orders/create-options'] });
        showToast({ title: 'Category saved', message: `${result.data.category.name} was updated.`, tone: 'success' });
        onClose();
      },
      onError: (error) => {
        const message = getApiErrorMessage(error);
        setFeedback(message);
        showToast({ title: 'Category failed', message, tone: 'error' });
      }
    }
  });

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? '');
    setSortOrder(String(category?.sortOrder ?? 0));
    setFeedback('');
  }, [category, open]);

  const normalizedSortOrder = Math.max(0, Number.parseInt(sortOrder, 10) || 0);
  const saving = createMutation.isPending || updateMutation.isPending;
  const canSave = Boolean(name.trim());

  /**
   * Description: Implements submitCategory.
   * Parameters: none.
   * Returns: void after dispatching category mutation.
   */
  function submitCategory() {
    setFeedback('');
    const data = { name: name.trim(), sortOrder: normalizedSortOrder };
    if (category) {
      updateMutation.mutate({ categoryId: category.id, data });
      return;
    }
    createMutation.mutate({ data });
  }

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(16,16,16,0.22)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <Pressable accessibilityRole="button" onPress={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
        <View style={{ width: 480, maxWidth: '96%', borderRadius: radius.lg, backgroundColor: colors.background.elevated, padding: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md }}>
            <View>
              <Text style={{ color: colors.text.primary, fontSize: typography.sectionTitle.fontSize, fontWeight: typography.sectionTitle.fontWeight }}>{category ? 'Edit category' : 'Create category'}</Text>
              <Text style={{ marginTop: spacing.xs, color: colors.text.secondary, fontSize: typography.body.fontSize }}>Control menu grouping and display order.</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onClose} style={[{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted }, pointerStyle]}>
              <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '900' }}>×</Text>
            </Pressable>
          </View>
          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            <TextField label="Category name" value={name} onChangeText={setName} />
            <TextField label="Sort order" value={sortOrder} onChangeText={setSortOrder} keyboardType="number-pad" />
          </View>
          {feedback ? <Text style={{ marginTop: spacing.md, color: colors.text.error, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{feedback}</Text> : null}
          <View style={{ marginTop: spacing.xl, flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm }}>
            <View style={{ width: 130 }}><Button variant="secondary" onPress={onClose}>Cancel</Button></View>
            <View style={{ width: 160 }}><Button disabled={!canSave} loading={saving} onPress={submitCategory}>{category ? 'Save category' : 'Create category'}</Button></View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
