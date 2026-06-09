import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, TextInput, View, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import { colors, componentTokens } from '../tokens';

export type TextFieldProps = TextInputProps & {
  hasError?: boolean;
  label?: string;
  containerStyle?: ViewStyle;
};

const webFocusResetStyle = Platform.select<TextStyle>({
  web: {
    outlineColor: colors.borderColor.focus,
    outlineStyle: 'solid',
    outlineWidth: 0
  } as TextStyle,
  default: {}
});

/**
 * Description: Implements hasTextValue.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function hasTextValue(value: unknown) {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Description: Implements TextField.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function TextField({ defaultValue, hasError, label, onBlur, onFocus, onChangeText, placeholder, style, value, containerStyle, ...props }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [innerValue, setInnerValue] = useState(() => (typeof defaultValue === 'string' ? defaultValue : ''));
  const displayValue = value ?? innerValue;
  const active = focused || hasTextValue(displayValue);
  const labelText = label ?? placeholder;
  const animation = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: active ? 1 : 0,
      duration: 140,
      useNativeDriver: false
    }).start();
  }, [active, animation]);

  const labelStyle = useMemo(
    () => ({
      top: animation.interpolate({ inputRange: [0, 1], outputRange: [componentTokens.input.labelRestTop, componentTokens.input.labelTop] }),
      fontSize: animation.interpolate({ inputRange: [0, 1], outputRange: [componentTokens.input.labelRestSize, componentTokens.input.labelSize] }),
      color: hasError ? colors.text.error : active ? colors.text.primary : colors.text.secondary
    }),
    [active, animation, hasError]
  );

  return (
    <View
      style={[
        {
          minHeight: componentTokens.input.minHeight,
          borderWidth: componentTokens.input.borderWidth,
          borderColor: hasError ? colors.borderColor.error : focused ? colors.borderColor.focus : colors.borderColor.default,
          borderRadius: componentTokens.input.borderRadius,
          backgroundColor: colors.background.elevated,
          justifyContent: 'center'
        },
        containerStyle
      ]}
    >
      {labelText ? (
        <Animated.Text pointerEvents="none" style={[{ position: 'absolute', left: componentTokens.input.paddingHorizontal, zIndex: 1, fontWeight: active ? '700' : '400' }, labelStyle]}>
          {labelText}
        </Animated.Text>
      ) : null}
      <TextInput
        accessibilityLabel={labelText}
        defaultValue={defaultValue}
        placeholder={active ? placeholder : undefined}
        placeholderTextColor={colors.text.muted}
        value={value}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onChangeText={(nextValue) => {
          setInnerValue(nextValue);
          onChangeText?.(nextValue);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        style={[
          {
            minHeight: componentTokens.input.innerHeight,
            borderWidth: 0,
            paddingHorizontal: componentTokens.input.paddingHorizontal,
            paddingTop: labelText ? 20 : 0,
            fontSize: 16,
            color: colors.text.primary,
            backgroundColor: 'transparent'
          },
          focused && !hasError ? webFocusResetStyle : null,
          style
        ]}
        {...props}
      />
    </View>
  );
}
