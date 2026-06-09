import { Platform, Pressable, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../tokens';

export type SelectPillProps<TValue extends string> = {
  label: string;
  selected: boolean;
  value: TValue;
  onSelect: (value: TValue) => void;
};

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

/**
 * Description: Implements SelectPill.
 * Parameters: props SelectPillProps selectable value, selected state, visible label, and selection handler.
 * Returns: JSX pill selection control.
 */
export function SelectPill<TValue extends string>({ label, onSelect, selected, value }: SelectPillProps<TValue>) {
  return (
    <Pressable accessibilityRole="button" onPress={() => onSelect(value)} style={[{ minHeight: 40, borderWidth: 1, borderColor: selected ? colors.borderColor.focus : colors.borderColor.default, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? colors.background.muted : colors.background.elevated, paddingHorizontal: spacing.lg }, pointerStyle]}>
      <Text style={{ color: colors.text.primary, fontSize: typography.caption.fontSize, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}
