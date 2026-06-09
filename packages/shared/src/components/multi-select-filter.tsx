import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { colors, componentTokens, radius, spacing, typography } from '../tokens';

export type MultiSelectFilterOption<TValue extends string> = {
  label: string;
  value: TValue;
};

export type MultiSelectFilterProps<TValue extends string> = {
  id: string;
  label: string;
  onSelectAll: () => void;
  onToggle: (value: TValue) => void;
  openId: string | null;
  options: Array<MultiSelectFilterOption<TValue>>;
  selectedValues: TValue[];
  setOpenId: (value: string | null) => void;
};

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;

/**
 * Description: Implements CheckBoxMark.
 * Parameters: checked boolean selected state, partial boolean indeterminate state.
 * Returns: JSX checkbox mark.
 */
function CheckBoxMark({ checked, partial = false }: { checked: boolean; partial?: boolean }) {
  const active = checked || partial;

  return (
    <View style={{ width: 18, height: 18, borderWidth: 1, borderColor: active ? colors.borderColor.focus : colors.borderColor.strong, borderRadius: 4, backgroundColor: active ? colors.black : colors.background.elevated, alignItems: 'center', justifyContent: 'center' }}>
      {checked ? <Text style={{ color: colors.text.inverse, fontSize: 12, lineHeight: 14, fontWeight: '900' }}>✓</Text> : null}
      {partial ? <View style={{ width: 9, height: 2, borderRadius: 1, backgroundColor: colors.text.inverse }} /> : null}
    </View>
  );
}

/**
 * Description: Implements MultiSelectFilterRow.
 * Parameters: label string row label, checked boolean selected state, partial boolean indeterminate state, count number optional count, strong boolean emphasized text, onPress function selection handler.
 * Returns: JSX dropdown option row.
 */
function MultiSelectFilterRow({ checked, count, label, onPress, partial = false, strong = false }: { label: string; checked: boolean; partial?: boolean; count?: number; strong?: boolean; onPress: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        {
          minHeight: 42,
          paddingHorizontal: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: hovered ? colors.background.muted : colors.background.elevated
        },
        pointerStyle
      ]}
    >
      <Text style={{ flex: 1, color: colors.text.primary, fontSize: typography.body.fontSize, fontWeight: strong ? '900' : '700' }}>{label}</Text>
      {typeof count === 'number' ? <Text style={{ minWidth: 24, color: colors.text.primary, fontSize: typography.body.fontSize, textAlign: 'right' }}>{count}</Text> : null}
      <CheckBoxMark checked={checked} partial={partial} />
    </Pressable>
  );
}

/**
 * Description: Implements MultiSelectFilter.
 * Parameters: props MultiSelectFilterProps dropdown id, label, options, selected values, open state, and handlers.
 * Returns: JSX multi-select filter dropdown.
 */
export function MultiSelectFilter<TValue extends string>({ id, label, onSelectAll, onToggle, openId, options, selectedValues, setOpenId }: MultiSelectFilterProps<TValue>) {
  const open = openId === id;
  const allSelected = selectedValues.length === options.length;
  const partiallySelected = selectedValues.length > 0 && !allSelected;
  const summary = allSelected ? 'ALL' : selectedValues.length === 1 ? options.find((option) => option.value === selectedValues[0])?.label : selectedValues.length > 1 ? String(selectedValues.length) : '';

  return (
    <View style={{ position: 'relative', zIndex: open ? 100 : 1 }}>
      {open ? <Pressable accessibilityRole="button" onPress={() => setOpenId(null)} style={{ position: 'absolute', top: -1000, right: -1000, bottom: -1000, left: -1000, zIndex: 80 }} /> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpenId(open ? null : id)}
        style={[
          {
            position: 'relative',
            zIndex: 110,
            minHeight: componentTokens.button.minHeight,
            borderWidth: 1,
            borderColor: open ? colors.borderColor.focus : colors.borderColor.default,
            borderRadius: componentTokens.button.borderRadius,
            justifyContent: 'center',
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.background.elevated
          },
          pointerStyle
        ]}
      >
        <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{summary ? `${label}  ${summary}` : label}</Text>
      </Pressable>
      {open ? (
        <View style={{ position: 'absolute', top: 56, left: 0, minWidth: 228, zIndex: 120, borderWidth: 1, borderColor: colors.borderColor.subtle, borderRadius: radius.lg, backgroundColor: colors.background.elevated, paddingVertical: spacing.sm, shadowColor: colors.black, shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } }}>
          <MultiSelectFilterRow checked={allSelected} partial={partiallySelected} label="Select all" count={selectedValues.length} strong onPress={onSelectAll} />
          {options.map((option) => {
            const checked = selectedValues.includes(option.value);
            return <MultiSelectFilterRow key={option.value} checked={checked} label={option.label} onPress={() => onToggle(option.value)} />;
          })}
        </View>
      ) : null}
    </View>
  );
}
