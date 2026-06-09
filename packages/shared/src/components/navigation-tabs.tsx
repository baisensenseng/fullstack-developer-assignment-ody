import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { colors, componentTokens, spacing } from '../tokens';

export type NavigationTabItem<TValue extends string> = {
  label: string;
  value: TValue;
};

export type NavigationTabsProps<TValue extends string> = {
  items: Array<NavigationTabItem<TValue>>;
  onChange: (value: TValue) => void;
  value: TValue;
};

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

/**
 * Description: Implements NavigationTabs.
 * Parameters: items array tab labels and values, value active tab value, onChange function tab change handler.
 * Returns: JSX horizontal navigation tabs.
 */
export function NavigationTabs<TValue extends string>({ items, onChange, value }: NavigationTabsProps<TValue>) {
  const [hoveredValue, setHoveredValue] = useState<TValue | null>(null);

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.borderColor.subtle, flexDirection: 'row', gap: spacing.lg }}>
      {items.map((item) => {
        const active = item.value === value;
        const hovered = hoveredValue === item.value;

        return (
          <Pressable
            key={item.value}
            accessibilityRole="button"
            onHoverIn={() => setHoveredValue(item.value)}
            onHoverOut={() => setHoveredValue((current) => current === item.value ? null : current)}
            onPress={() => onChange(item.value)}
            style={[
              {
                paddingHorizontal: spacing.sm,
                paddingTop: spacing.xs,
                paddingBottom: componentTokens.navigationTab.paddingBottom,
                borderBottomWidth: componentTokens.navigationTab.indicatorWidth,
                borderBottomColor: active ? colors.borderColor.focus : 'transparent'
              },
              pointerStyle
            ]}
          >
            <Text style={{ color: active || hovered ? colors.text.primary : colors.text.secondary, fontSize: componentTokens.navigationTab.fontSize, fontWeight: active ? componentTokens.navigationTab.activeFontWeight : componentTokens.navigationTab.inactiveFontWeight }}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
