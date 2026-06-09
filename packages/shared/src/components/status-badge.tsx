import { Text, View } from 'react-native';
import { colors, componentTokens } from '../tokens';

export type StatusBadgeTone = 'success' | 'warning' | 'error' | 'info';

export type StatusBadgeProps = {
  label: string;
  tone: StatusBadgeTone;
};

const toneStyles = {
  success: { backgroundColor: colors.status.successBg, color: colors.status.success },
  warning: { backgroundColor: colors.status.warningBg, color: colors.status.warning },
  error: { backgroundColor: colors.status.errorBg, color: colors.status.error },
  info: { backgroundColor: colors.status.infoBg, color: colors.status.info }
} as const;

/**
 * Description: Implements StatusBadge.
 * Parameters: label string visible badge label, tone StatusBadgeTone semantic badge tone.
 * Returns: JSX status badge.
 */
export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const style = toneStyles[tone];

  return (
    <View style={{ borderRadius: componentTokens.badge.borderRadius, backgroundColor: style.backgroundColor, paddingHorizontal: componentTokens.badge.paddingHorizontal, paddingVertical: componentTokens.badge.paddingVertical }}>
      <Text style={{ color: style.color, fontSize: componentTokens.badge.fontSize, fontWeight: '900' }}>{label}</Text>
    </View>
  );
}
