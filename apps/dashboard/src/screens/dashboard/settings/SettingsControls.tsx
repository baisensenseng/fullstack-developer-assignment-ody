import { colors, radius, spacing, typography } from '@ody/shared';
import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { formatOpeningHours, parseOpeningHours } from './opening-hours';

const pointerStyle = Platform.OS === 'web' ? ({ cursor: 'pointer' } as const) : undefined;
const timeOptions = ['Closed', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'] as const;

type DayPart = 'weekdays' | 'weekend';
type TimeField = 'open' | 'close';

export type OpeningHoursEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * Description: Implements TimeSelect.
 * Parameters: label string field label, value string selected time, onSelect function selected time handler.
 * Returns: JSX time picker trigger and modal.
 */
function TimeSelect({ label, onSelect, value }: { label: string; value: string; onSelect: (value: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.text.secondary, fontSize: typography.caption.fontSize, fontWeight: '800' }}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={[{ marginTop: spacing.xs, minHeight: 44, borderWidth: 1, borderColor: colors.borderColor.default, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.elevated, paddingHorizontal: spacing.md }, pointerStyle]}>
        <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>{value}</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(16,16,16,0.22)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
          <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
          <View style={{ width: 280, maxHeight: 420, borderWidth: 1, borderColor: colors.borderColor.subtle, borderRadius: radius.lg, backgroundColor: colors.background.elevated, overflow: 'hidden' }}>
            <Text style={{ padding: spacing.lg, color: colors.text.primary, fontSize: typography.cardTitle.fontSize, fontWeight: typography.cardTitle.fontWeight }}>Select {label.toLowerCase()}</Text>
            <ScrollView>
              {timeOptions.map((option) => (
                <Pressable key={option} accessibilityRole="button" onPress={() => { onSelect(option); setOpen(false); }} style={[{ minHeight: 44, borderTopWidth: 1, borderTopColor: colors.borderColor.subtle, alignItems: 'center', justifyContent: 'center', backgroundColor: value === option ? colors.background.muted : colors.background.elevated }, pointerStyle]}>
                  <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: value === option ? '900' : '700' }}>{option}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/**
 * Description: Implements OpeningHoursEditor.
 * Parameters: props OpeningHoursEditorProps persisted value and change handler.
 * Returns: JSX structured opening hours editor.
 */
export function OpeningHoursEditor({ onChange, value }: OpeningHoursEditorProps) {
  const parsedValue = parseOpeningHours(value);

  /**
   * Description: Implements updateHours.
   * Parameters: dayPart DayPart selected day group, field TimeField selected time field, nextValue string selected time value.
   * Returns: void after emitting formatted opening hours.
   */
  function updateHours(dayPart: DayPart, field: TimeField, nextValue: string) {
    const nextHours = { ...parsedValue, [dayPart]: { ...parsedValue[dayPart], [field]: nextValue } };
    onChange(formatOpeningHours(nextHours));
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: spacing.lg }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>Weekdays</Text>
        <View style={{ marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm }}>
          <TimeSelect label="Open" value={parsedValue.weekdays.open} onSelect={(nextValue) => updateHours('weekdays', 'open', nextValue)} />
          <TimeSelect label="Close" value={parsedValue.weekdays.close} onSelect={(nextValue) => updateHours('weekdays', 'close', nextValue)} />
        </View>
      </View>
      <View style={{ width: 1, backgroundColor: colors.borderColor.subtle }} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.bodyStrong.fontSize, fontWeight: typography.bodyStrong.fontWeight }}>Weekend</Text>
        <View style={{ marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm }}>
          <TimeSelect label="Open" value={parsedValue.weekend.open} onSelect={(nextValue) => updateHours('weekend', 'open', nextValue)} />
          <TimeSelect label="Close" value={parsedValue.weekend.close} onSelect={(nextValue) => updateHours('weekend', 'close', nextValue)} />
        </View>
      </View>
    </View>
  );
}
