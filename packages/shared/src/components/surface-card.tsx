import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { colors, componentTokens } from '../tokens';

export type SurfaceCardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

/**
 * Description: Implements SurfaceCard.
 * Parameters: children ReactNode card content, style ViewStyle optional card overrides.
 * Returns: JSX surface card container.
 */
export function SurfaceCard({ children, style }: SurfaceCardProps) {
  return (
    <View style={[{ borderWidth: componentTokens.card.borderWidth, borderColor: componentTokens.card.borderColor, borderRadius: componentTokens.card.borderRadius, backgroundColor: colors.background.elevated, padding: componentTokens.card.padding }, style]}>
      {children}
    </View>
  );
}
