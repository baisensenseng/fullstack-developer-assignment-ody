import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { colors, componentTokens } from '../tokens';

export type ButtonProps = PressableProps & {
  children: ReactNode;
  loading?: boolean;
  textNumberOfLines?: number;
  variant?: 'primary' | 'secondary';
};

/**
 * Description: Implements Button.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function Button({ children, disabled, loading, textNumberOfLines, variant = 'primary', style, ...props }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          minHeight: componentTokens.button.minHeight,
          borderRadius: componentTokens.button.borderRadius,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isPrimary ? colors.action.primary : colors.action.secondary,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: colors.borderColor.default,
          opacity: disabled ? 0.55 : pressed ? 0.82 : 1,
          paddingHorizontal: componentTokens.button.paddingHorizontal
        },
        typeof style === 'function' ? style({ pressed }) : style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.action.primaryText : colors.text.primary} />
      ) : (
        <Text numberOfLines={textNumberOfLines} style={{ color: isPrimary ? colors.action.primaryText : colors.action.secondaryText, fontSize: componentTokens.button.fontSize, fontWeight: componentTokens.button.fontWeight, textAlign: 'center' }}>{children}</Text>
      )}
    </Pressable>
  );
}
