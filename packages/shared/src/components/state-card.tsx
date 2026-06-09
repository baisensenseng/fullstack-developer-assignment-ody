import { CircleAlert, Clock, Inbox, SearchX, ShoppingBag, TrendingUp, Users, Utensils, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, Text, View, type ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../tokens';
import { Button } from './button';
import { SurfaceCard } from './surface-card';

export type LoadingStateCardProps = {
  label: string;
};

export type ErrorStateCardProps = {
  description: string;
  onRetry: () => void;
  title: string;
};

export type EmptyStateIconName = 'default' | 'orders' | 'menu' | 'customers' | 'search' | 'popular' | 'recent' | 'warning';

export type EmptyStateCardProps = {
  action?: ReactNode;
  compact?: boolean;
  description: string;
  icon?: EmptyStateIconName;
  style?: ViewStyle;
  title: string;
};

const emptyStateIcons: Record<EmptyStateIconName, LucideIcon> = {
  default: Inbox,
  orders: ShoppingBag,
  menu: Utensils,
  customers: Users,
  search: SearchX,
  popular: TrendingUp,
  recent: Clock,
  warning: CircleAlert
};

/**
 * Description: Implements LoadingStateCard.
 * Parameters: label string loading message.
 * Returns: JSX loading card.
 */
export function LoadingStateCard({ label }: LoadingStateCardProps) {
  return (
    <SurfaceCard style={{ minHeight: 220, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.text.primary} />
      <Text style={{ marginTop: spacing.md, color: colors.text.secondary, fontSize: typography.body.fontSize }}>{label}</Text>
    </SurfaceCard>
  );
}

/**
 * Description: Implements ErrorStateCard.
 * Parameters: title string error title, description string error copy, onRetry function retry handler.
 * Returns: JSX error card.
 */
export function ErrorStateCard({ description, onRetry, title }: ErrorStateCardProps) {
  return (
    <SurfaceCard style={{ minHeight: 220, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.text.primary, fontSize: typography.cardTitle.fontSize, fontWeight: typography.cardTitle.fontWeight }}>{title}</Text>
      <Text style={{ marginTop: spacing.sm, color: colors.text.secondary, fontSize: typography.body.fontSize }}>{description}</Text>
      <View style={{ width: 140, marginTop: spacing.lg }}>
        <Button variant="secondary" onPress={onRetry}>Retry</Button>
      </View>
    </SurfaceCard>
  );
}

/**
 * Description: Implements EmptyStateCard.
 * Parameters: props EmptyStateCardProps empty title, description, icon, action, density, and style.
 * Returns: JSX empty state block.
 */
export function EmptyStateCard({ action, compact = false, description, icon = 'default', style, title }: EmptyStateCardProps) {
  const Icon = emptyStateIcons[icon];

  return (
    <View style={[{ minHeight: compact ? 120 : 180, borderWidth: 1, borderColor: colors.borderColor.subtle, borderRadius: radius.md, backgroundColor: colors.background.subtle, alignItems: 'center', justifyContent: 'center', padding: compact ? spacing.lg : spacing.xl }, style]}>
      <View style={{ width: compact ? 40 : 48, height: compact ? 40 : 48, borderWidth: 1, borderColor: colors.borderColor.subtle, borderRadius: compact ? 20 : 24, backgroundColor: colors.background.elevated, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={compact ? 19 : 22} color={colors.text.secondary} strokeWidth={1.8} />
      </View>
      <Text style={{ marginTop: spacing.md, color: colors.text.primary, fontSize: compact ? typography.bodyStrong.fontSize : typography.cardTitle.fontSize, fontWeight: typography.cardTitle.fontWeight, textAlign: 'center' }}>{title}</Text>
      <Text style={{ marginTop: spacing.sm, maxWidth: 420, color: colors.text.secondary, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight, textAlign: 'center' }}>{description}</Text>
      {action ? <View style={{ marginTop: spacing.lg }}>{action}</View> : null}
    </View>
  );
}
