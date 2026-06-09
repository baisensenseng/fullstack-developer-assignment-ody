import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import { colors, spacing, typography } from '../tokens';

export type ToggleRowProps = {
  description: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

/**
 * Description: Implements ToggleRow.
 * Parameters: props ToggleRowProps label, description, current value, and change handler.
 * Returns: JSX settings toggle row.
 */
export function ToggleRow({ description, label, onChange, value }: ToggleRowProps) {
  const translateX = useRef(new Animated.Value(value ? 22 : 0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 22 : 0,
      duration: 180,
      useNativeDriver: true
    }).start();
  }, [translateX, value]);

  return (
    <View style={{ minHeight: 72, borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{label}</Text>
        <Text style={{ marginTop: spacing.xs, color: colors.text.secondary, fontSize: typography.caption.fontSize, lineHeight: typography.caption.lineHeight }}>{description}</Text>
      </View>
      <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={() => onChange(!value)} style={[{ width: 52, height: 30, borderWidth: value ? 1 : 2, borderColor: value ? colors.action.primary : colors.text.muted, borderRadius: 15, backgroundColor: value ? colors.action.primary : colors.background.elevated, padding: 2, justifyContent: 'center' }, pointerStyle]}>
        <Animated.View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: value ? colors.background.elevated : colors.text.muted, transform: [{ translateX }] }} />
      </Pressable>
    </View>
  );
}
