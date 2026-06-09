import type { CreateCustomerBody, ListCustomers200CustomersItem, UpdateCustomerBody } from '@ody/api-client';
import { Button, colors, spacing, SurfaceCard, TextField, typography } from '@ody/shared';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

export type CustomerFormValues = CreateCustomerBody & UpdateCustomerBody;

export type CustomerFormModalProps = {
  customer: ListCustomers200CustomersItem | null;
  error: string;
  loading: boolean;
  mode: 'create' | 'edit';
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: CustomerFormValues) => void;
};

/**
 * Description: Implements getInitialValues.
 * Parameters: customer ListCustomers200CustomersItem nullable customer row.
 * Returns: CustomerFormValues form defaults.
 */
function getInitialValues(customer: ListCustomers200CustomersItem | null): CustomerFormValues {
  return {
    name: customer?.name ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    notes: customer?.notes ?? '',
    tags: customer?.tags ?? ''
  };
}

/**
 * Description: Implements CustomerFormModal.
 * Parameters: props CustomerFormModalProps modal state, selected customer, and submit handlers.
 * Returns: JSX customer create or edit modal.
 */
export function CustomerFormModal({ customer, error, loading, mode, onClose, onSubmit, visible }: CustomerFormModalProps) {
  const [values, setValues] = useState<CustomerFormValues>(() => getInitialValues(customer));

  useEffect(() => {
    if (visible) setValues(getInitialValues(customer));
  }, [customer, visible]);

  const title = mode === 'create' ? 'Create customer' : 'Edit customer';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(16,16,16,0.22)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
        <Pressable accessibilityRole="button" onPress={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
        <SurfaceCard style={{ width: 560, maxWidth: '100%', maxHeight: '92%', padding: 0, overflow: 'hidden' }}>
          <View style={{ borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
            <Text style={{ color: colors.text.primary, fontSize: typography.sectionTitle.fontSize, lineHeight: typography.sectionTitle.lineHeight, fontWeight: typography.sectionTitle.fontWeight }}>{title}</Text>
            <Pressable accessibilityRole="button" onPress={onClose} style={[{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted }, pointerStyle]}>
              <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '900' }}>×</Text>
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
            <TextField label="Name" value={values.name} onChangeText={(name) => setValues((current) => ({ ...current, name }))} />
            <TextField label="Email" value={values.email} keyboardType="email-address" autoCapitalize="none" onChangeText={(email) => setValues((current) => ({ ...current, email }))} />
            <TextField label="Phone" value={values.phone} onChangeText={(phone) => setValues((current) => ({ ...current, phone }))} />
            <TextField label="Tags" value={values.tags} onChangeText={(tags) => setValues((current) => ({ ...current, tags }))} />
            <TextField label="Notes" value={values.notes} multiline style={{ minHeight: 104, paddingTop: 24, textAlignVertical: 'top' }} containerStyle={{ minHeight: 124 }} onChangeText={(notes) => setValues((current) => ({ ...current, notes }))} />
            {error ? <Text style={{ color: colors.text.error, fontSize: typography.caption.fontSize, fontWeight: '800' }}>{error}</Text> : null}
          </ScrollView>
          <View style={{ borderTopWidth: 1, borderTopColor: colors.borderColor.subtle, padding: spacing.lg, flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm }}>
            <View style={{ width: 120 }}><Button variant="secondary" disabled={loading} onPress={onClose}>Cancel</Button></View>
            <View style={{ width: 160 }}><Button loading={loading} onPress={() => onSubmit(values)}>{mode === 'create' ? 'Create' : 'Save'}</Button></View>
          </View>
        </SurfaceCard>
      </View>
    </Modal>
  );
}
