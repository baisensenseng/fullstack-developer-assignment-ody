import { Archive, ArrowRightCircle, Bell, CheckCircle, Clock, DollarSign, ListTree, ShoppingBag, Users, Utensils, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { Text } from 'react-native';
import { colors, componentTokens, spacing, typography } from '../tokens';
import { SurfaceCard } from './surface-card';

export type MetricCardProps = {
  helper: string;
  label: string;
  value: string;
};

/**
 * Description: Implements getMetricIcon.
 * Parameters: label string metric label.
 * Returns: LucideIcon matched to the metric label.
 */
function getMetricIcon(label: string): LucideIcon {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel.includes('revenue') || normalizedLabel.includes('spend') || normalizedLabel.includes('avg')) return DollarSign;
  if (normalizedLabel.includes('pending') || normalizedLabel.includes('prep') || normalizedLabel.includes('hour') || normalizedLabel.includes('last')) return Clock;
  if (normalizedLabel.includes('available') || normalizedLabel.includes('active') || normalizedLabel.includes('ordering')) return CheckCircle;
  if (normalizedLabel.includes('unavailable') || normalizedLabel.includes('archived')) return Archive;
  if (normalizedLabel.includes('customer')) return Users;
  if (normalizedLabel.includes('category')) return ListTree;
  if (normalizedLabel.includes('item')) return Utensils;
  if (normalizedLabel.includes('acceptance') || normalizedLabel.includes('fulfillment')) return ArrowRightCircle;
  if (normalizedLabel.includes('alert')) return Bell;
  if (normalizedLabel.includes('order')) return ShoppingBag;
  return CheckCircle;
}

/**
 * Description: Implements MetricCard.
 * Parameters: label string metric label, value string metric value, helper string supporting text.
 * Returns: JSX metric card.
 */
export function MetricCard({ helper, label, value }: MetricCardProps) {
  const Icon = getMetricIcon(label);

  return (
    <SurfaceCard style={{ flex: 1, minWidth: 190, justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: componentTokens.metricCard.contentGap }}>
        <View style={{ width: componentTokens.metricCard.iconSize, height: componentTokens.metricCard.iconSize, borderRadius: componentTokens.metricCard.iconRadius, alignItems: 'center', justifyContent: 'center', backgroundColor: componentTokens.metricCard.iconBackground }}>
          <Icon size={componentTokens.metricCard.iconGlyphSize} color={colors.text.primary} strokeWidth={componentTokens.metricCard.iconStrokeWidth} />
        </View>
        <View style={{ minWidth: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: typography.label.fontWeight, textAlign: 'center', textTransform: 'uppercase' }}>{label}</Text>
          <Text style={{ marginTop: spacing.xs, color: colors.text.primary, fontSize: componentTokens.data.metricFontSize, lineHeight: componentTokens.data.metricLineHeight, fontWeight: typography.metric.fontWeight, textAlign: 'center' }}>{value}</Text>
          <Text style={{ marginTop: spacing.xs, color: colors.text.muted, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight, textAlign: 'center' }}>{helper}</Text>
        </View>
      </View>
    </SurfaceCard>
  );
}
