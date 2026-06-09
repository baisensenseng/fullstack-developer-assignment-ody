import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, TextInput, View, type ViewStyle } from 'react-native';
import { colors, componentTokens, spacing, typography } from '../tokens';

export type SearchInputProps = {
  containerStyle?: ViewStyle;
  onChangeText: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  value: string;
};

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

/**
 * Description: Implements SearchInput.
 * Parameters: props SearchInputProps controlled value, placeholder, change handler, clear handler, and optional container style.
 * Returns: JSX rounded search input with clear action.
 */
export function SearchInput({ containerStyle, onChangeText, onClear, placeholder, value }: SearchInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ position: 'relative' }, containerStyle]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          {
            minHeight: componentTokens.button.minHeight,
            borderWidth: 1,
            borderColor: focused ? colors.borderColor.focus : colors.borderColor.default,
            borderRadius: componentTokens.button.borderRadius,
            backgroundColor: colors.background.elevated,
            paddingLeft: spacing.lg,
            paddingRight: value ? 52 : spacing.lg,
            color: colors.text.primary,
            fontSize: typography.body.fontSize,
            fontWeight: '600'
          },
          Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : undefined
        ]}
      />
      {value ? (
        <Pressable accessibilityRole="button" onPress={onClear} style={[{ position: 'absolute', right: 8, top: 6, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted }, pointerStyle]}>
          <X size={18} color={colors.text.primary} strokeWidth={2.4} />
        </Pressable>
      ) : null}
    </View>
  );
}
