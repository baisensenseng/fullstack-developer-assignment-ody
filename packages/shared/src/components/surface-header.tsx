import { Text, View } from 'react-native';
import { colors, spacing, typography } from '../tokens';

export type SurfaceHeaderProps = {
  caption?: string;
  title: string;
};

/**
 * Description: Implements SurfaceHeader.
 * Parameters: title string module title, caption string optional module description.
 * Returns: JSX surface module header.
 */
export function SurfaceHeader({ caption, title }: SurfaceHeaderProps) {
  return (
    <View>
      <Text style={{ color: colors.text.primary, fontSize: typography.cardTitle.fontSize, lineHeight: typography.cardTitle.lineHeight, fontWeight: typography.cardTitle.fontWeight }}>{title}</Text>
      {caption ? <Text style={{ marginTop: spacing.xs, color: colors.text.secondary, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight }}>{caption}</Text> : null}
    </View>
  );
}
