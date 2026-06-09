import { Platform, Pressable, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../tokens';

export type SegmentedButtonProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

/**
 * Description: Implements SegmentedButton.
 * Parameters: active boolean selected state, label string visible label, onPress function press handler.
 * Returns: JSX segmented control button.
 */
export function SegmentedButton({ active, label, onPress }: SegmentedButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[{ minHeight: 42, borderWidth: 1, borderColor: active ? colors.borderColor.focus : colors.borderColor.default, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.background.muted : colors.background.elevated, paddingHorizontal: spacing.lg }, pointerStyle]}>
      <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{label}</Text>
    </Pressable>
  );
}
