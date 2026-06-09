import { useCreateOrder, type CreateOrderBody, type ListOrderCreateOptions200 } from '@ody/api-client';
import { Button, colors, EmptyStateCard, LoadingStateCard, ModalFrame, radius, spacing, TextField, typography, useToast } from '@ody/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { formatCurrency, matchesCustomerQuery } from './order-formatters';

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;
/**
 * Description: Implements CreateOrderPanel.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function CreateOrderPanel({ onClose, onCreated, options }: { options: ListOrderCreateOptions200; onClose: () => void; onCreated: (orderId: string) => void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [customerId, setCustomerId] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<CreateOrderBody['fulfillmentType']>('pickup');
  const [selectedItemId, setSelectedItemId] = useState(options.menuItems[0]?.id ?? '');
  const [quantity, setQuantity] = useState('1');
  const [cartItems, setCartItems] = useState<CreateOrderBody['items']>([]);
  const [feedback, setFeedback] = useState('');
  const createMutation = useCreateOrder({
    mutation: {
      onSuccess: async (result) => {
        if (result.status !== 201) return;
        setFeedback(`Created ${result.data.order.orderNumber}`);
        showToast({ title: 'Order created', message: `${result.data.order.orderNumber} was added to the queue.`, tone: 'success' });
        await queryClient.invalidateQueries({ queryKey: ['/orders'] });
        await queryClient.invalidateQueries({ queryKey: ['/summary'] });
        onCreated(result.data.order.id);
        onClose();
      },
      onError: (error) => {
        const apiError = error as { error?: { message?: string } };
        const message = apiError.error?.message ?? 'Could not create order.';
        setFeedback(message);
        showToast({ title: 'Order not created', message, tone: 'error' });
      }
    }
  });

  const customerResults = options.customers.filter((customer) => matchesCustomerQuery(customer, customerQuery));
  const selectedCustomer = options.customers.find((customer) => customer.id === customerId);
  const selectedItem = options.menuItems.find((item) => item.id === selectedItemId);
  const normalizedQuantity = Math.max(1, Number.parseInt(quantity, 10) || 1);
  const estimatedTotal = cartItems.reduce((total, cartItem) => {
    const item = options.menuItems.find((menuItem) => menuItem.id === cartItem.menuItemId);
    return total + (item ? item.priceCents * cartItem.quantity : 0);
  }, 0);
  const canCreateWithExistingCustomer = customerMode === 'existing' && Boolean(customerId);
  const canCreateWithNewCustomer = customerMode === 'new' && Boolean(newCustomerName.trim() && newCustomerEmail.trim() && newCustomerPhone.trim());

  /**
 * Description: Implements addSelectedItemToCart.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
  function addSelectedItemToCart() {
    if (!selectedItemId) return;

    setCartItems((items) => {
      const existingItem = items.find((item) => item.menuItemId === selectedItemId);
      if (existingItem) return items.map((item) => item.menuItemId === selectedItemId ? { ...item, quantity: Math.min(20, item.quantity + normalizedQuantity) } : item);
      return [...items, { menuItemId: selectedItemId, quantity: normalizedQuantity }];
    });
    setQuantity('1');
  }

  /**
 * Description: Implements updateCartItemQuantity.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
  function updateCartItemQuantity(menuItemId: string, nextQuantity: number) {
    setCartItems((items) => items.map((item) => item.menuItemId === menuItemId ? { ...item, quantity: Math.max(1, Math.min(20, nextQuantity)) } : item));
  }

  /**
 * Description: Implements removeCartItem.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
  function removeCartItem(menuItemId: string) {
    setCartItems((items) => items.filter((item) => item.menuItemId !== menuItemId));
  }

  /**
 * Description: Implements submitOrder.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
  function submitOrder() {
    const customerPayload = customerMode === 'existing'
      ? { customerId }
      : { customer: { name: newCustomerName.trim(), email: newCustomerEmail.trim(), phone: newCustomerPhone.trim() } };

    createMutation.mutate({ data: { ...customerPayload, fulfillmentType, items: cartItems } });
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg }}>
        <View style={{ minWidth: 0, flex: 1 }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            {(['existing', 'new'] as const).map((mode) => (
              <Pressable key={mode} accessibilityRole="button" onPress={() => setCustomerMode(mode)} style={[{ minHeight: 40, flex: 1, borderWidth: 1, borderColor: customerMode === mode ? colors.borderColor.focus : colors.borderColor.default, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: customerMode === mode ? colors.background.muted : colors.background.elevated }, pointerStyle]}>
                <Text style={{ color: colors.text.primary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>{mode === 'existing' ? 'Existing customer' : 'New customer'}</Text>
              </Pressable>
            ))}
          </View>

          {customerMode === 'existing' ? (
            <View>
              <View style={{ position: 'relative' }}>
                <TextField
                  label="Search customer"
                  value={customerQuery}
                  onChangeText={(value) => {
                    setCustomerQuery(value);
                    setCustomerId('');
                  }}
                  style={{ paddingRight: 46 }}
                />
                {customerQuery ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setCustomerQuery('');
                      setCustomerId('');
                    }}
                    style={[{ position: 'absolute', right: 12, top: 14, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted }, pointerStyle]}
                  >
                    <Text style={{ color: colors.text.primary, fontSize: 18, lineHeight: 20, fontWeight: '900' }}>×</Text>
                  </Pressable>
                ) : null}
              </View>
              {selectedCustomer ? (
                <View style={{ marginTop: spacing.sm, borderWidth: 1, borderColor: colors.borderColor.focus, borderRadius: radius.md, backgroundColor: colors.background.muted, padding: spacing.md }}>
                  <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{selectedCustomer.name}</Text>
                  <Text style={{ marginTop: 2, color: colors.text.muted, fontSize: typography.caption.fontSize }}>{selectedCustomer.email} · {selectedCustomer.phone}</Text>
                </View>
              ) : (
                <View style={{ marginTop: spacing.sm, maxHeight: 224, borderWidth: 1, borderColor: colors.borderColor.subtle, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.background.elevated }}>
                  {customerResults.length ? (
                    <ScrollView>
                      {customerResults.map((customer) => (
                        <Pressable key={customer.id} accessibilityRole="button" onPress={() => {
                          setCustomerId(customer.id);
                          setCustomerQuery(customer.name);
                        }} style={[{ minHeight: 54, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, justifyContent: 'center', paddingHorizontal: spacing.md }, pointerStyle]}>
                          <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{customer.name}</Text>
                          <Text style={{ marginTop: 2, color: colors.text.muted, fontSize: typography.caption.fontSize }}>{customer.email} · {customer.phone}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  ) : (
                    <EmptyStateCard compact icon="search" title="No customer found" description="Switch to New customer to create one with this order." style={{ minHeight: 132, borderWidth: 0, borderRadius: 0 }} />
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <TextField label="Customer name" value={newCustomerName} onChangeText={setNewCustomerName} />
              <TextField label="Email" value={newCustomerEmail} onChangeText={setNewCustomerEmail} keyboardType="email-address" />
              <TextField label="Phone" value={newCustomerPhone} onChangeText={setNewCustomerPhone} keyboardType="phone-pad" />
            </View>
          )}
        </View>

        <View style={{ minWidth: 0, flex: 1.1 }}>
          <Text style={{ marginBottom: spacing.sm, color: colors.text.secondary, fontSize: typography.label.fontSize, fontWeight: typography.label.fontWeight }}>Menu item</Text>
          <View style={{ maxHeight: 248, gap: spacing.sm }}>
            <ScrollView>
              <View style={{ gap: spacing.sm }}>
                {options.menuItems.map((item) => (
                  <Pressable key={item.id} accessibilityRole="button" onPress={() => setSelectedItemId(item.id)} style={[{ borderWidth: 1, borderColor: selectedItemId === item.id ? colors.borderColor.focus : colors.borderColor.subtle, borderRadius: radius.md, backgroundColor: selectedItemId === item.id ? colors.background.muted : colors.background.elevated, padding: spacing.md }, pointerStyle]}>
                    <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{item.name}</Text>
                    <Text style={{ marginTop: 2, color: colors.text.muted, fontSize: typography.caption.fontSize }}>{item.categoryName} · {formatCurrency(item.priceCents)}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
          <View style={{ marginTop: spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
            <View style={{ width: 132 }}>
              <TextField label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Button variant="secondary" disabled={!selectedItem} onPress={addSelectedItemToCart}>Add item</Button>
            </View>
          </View>
        </View>

        <View style={{ width: 326, flexShrink: 1, gap: spacing.lg }}>
          <View>
            <Text style={{ marginBottom: spacing.sm, color: colors.text.secondary, fontSize: typography.label.fontSize, fontWeight: typography.label.fontWeight }}>Fulfillment</Text>
            <View style={{ gap: spacing.sm }}>
              {(['pickup', 'delivery', 'dine-in'] as const).map((item) => (
                <Pressable key={item} accessibilityRole="button" onPress={() => setFulfillmentType(item)} style={[{ minHeight: 58, borderWidth: 1, borderColor: fulfillmentType === item ? colors.borderColor.focus : colors.borderColor.subtle, borderRadius: radius.md, backgroundColor: fulfillmentType === item ? colors.background.muted : colors.background.elevated, justifyContent: 'center', paddingHorizontal: spacing.md }, pointerStyle]}>
                  <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight, textTransform: 'capitalize' }}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View>
            <Text style={{ marginBottom: spacing.sm, color: colors.text.secondary, fontSize: typography.label.fontSize, fontWeight: typography.label.fontWeight }}>Cart</Text>
            <View style={{ maxHeight: 174, borderWidth: 1, borderColor: colors.borderColor.subtle, borderRadius: radius.md, overflow: 'hidden' }}>
              {cartItems.length ? (
                <ScrollView>
                  {cartItems.map((cartItem) => {
                    const item = options.menuItems.find((menuItem) => menuItem.id === cartItem.menuItemId);
                    if (!item) return null;

                    return (
                      <View key={cartItem.menuItemId} style={{ minHeight: 58, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{item.name}</Text>
                          <Text style={{ color: colors.text.muted, fontSize: typography.caption.fontSize }}>{cartItem.quantity} × {formatCurrency(item.priceCents)}</Text>
                        </View>
                        <Pressable accessibilityRole="button" onPress={() => updateCartItemQuantity(cartItem.menuItemId, cartItem.quantity - 1)} style={[{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted }, pointerStyle]}>
                          <Text style={{ color: colors.text.primary, fontWeight: '900' }}>−</Text>
                        </Pressable>
                        <Pressable accessibilityRole="button" onPress={() => updateCartItemQuantity(cartItem.menuItemId, cartItem.quantity + 1)} style={[{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted }, pointerStyle]}>
                          <Text style={{ color: colors.text.primary, fontWeight: '900' }}>+</Text>
                        </Pressable>
                        <Pressable accessibilityRole="button" onPress={() => removeCartItem(cartItem.menuItemId)} style={[{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted }, pointerStyle]}>
                          <Text style={{ color: colors.text.primary, fontWeight: '900' }}>×</Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={{ minHeight: 86, alignItems: 'center', justifyContent: 'center', padding: spacing.md }}>
                  <Text style={{ color: colors.text.muted, fontSize: typography.body.fontSize, textAlign: 'center' }}>Add menu items to create an order.</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={{ marginTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.borderColor.subtle, paddingTop: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg }}>
        <Text style={{ flex: 1, color: createMutation.isError ? colors.text.error : colors.text.success, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{feedback}</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.label.fontSize, fontWeight: typography.label.fontWeight }}>Estimated total</Text>
          <Text style={{ marginTop: spacing.xs, color: colors.text.primary, fontSize: typography.metric.fontSize, lineHeight: typography.metric.lineHeight, fontWeight: typography.metric.fontWeight }}>{formatCurrency(estimatedTotal)}</Text>
        </View>
        <View style={{ width: 156 }}>
          <Button
            loading={createMutation.isPending}
            disabled={cartItems.length === 0 || !(canCreateWithExistingCustomer || canCreateWithNewCustomer)}
            onPress={submitOrder}
          >
            Create
          </Button>
        </View>
      </View>
    </View>
  );
}

/**
 * Description: Implements CreateOrderModal.
 * Parameters: open boolean visible state, options ListOrderCreateOptions200 create options, onClose function close handler, onCreated function created order handler.
 * Returns: JSX create order modal.
 */
export function CreateOrderModal({ onClose, onCreated, open, options }: { open: boolean; options: ListOrderCreateOptions200 | null; onClose: () => void; onCreated: (orderId: string) => void }) {
  return (
    <ModalFrame visible={open} onClose={onClose} contentStyle={{ width: 980, maxWidth: '96%' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <View>
          <Text style={{ color: colors.text.primary, fontSize: typography.sectionTitle.fontSize, fontWeight: typography.sectionTitle.fontWeight }}>Create order</Text>
          <Text style={{ marginTop: spacing.xs, color: colors.text.secondary, fontSize: typography.body.fontSize }}>Add a new order without leaving the order queue.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onClose} style={[{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted }, pointerStyle]}>
          <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '900' }}>×</Text>
        </Pressable>
      </View>
      {options ? <CreateOrderPanel options={options} onClose={onClose} onCreated={onCreated} /> : <LoadingStateCard label="Loading create options" />}
    </ModalFrame>
  );
}
