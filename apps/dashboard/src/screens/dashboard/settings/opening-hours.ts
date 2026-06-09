export type OpeningHoursValue = {
  weekdays: { open: string; close: string };
  weekend: { open: string; close: string };
};

/**
 * Description: Implements parseOpeningHours.
 * Parameters: value string persisted opening hours value.
 * Returns: OpeningHoursValue normalized editor state.
 */
export function parseOpeningHours(value: string): OpeningHoursValue {
  const weekdaysMatch = value.match(/Mon-Fri\s+([^;]+)/);
  const weekendMatch = value.match(/Sat-Sun\s+([^;]+)/);
  const parseRange = (range: string | undefined, fallbackOpen: string, fallbackClose: string) => {
    if (!range || range === 'Closed') return { open: range === 'Closed' ? 'Closed' : fallbackOpen, close: range === 'Closed' ? 'Closed' : fallbackClose };
    const [open, close] = range.split('-');
    return { open: open || fallbackOpen, close: close || fallbackClose };
  };

  return {
    weekdays: parseRange(weekdaysMatch?.[1], '09:00', '21:00'),
    weekend: parseRange(weekendMatch?.[1], '10:00', '22:00')
  };
}

/**
 * Description: Implements formatOpeningHours.
 * Parameters: value OpeningHoursValue editor state.
 * Returns: string persisted opening hours value.
 */
export function formatOpeningHours(value: OpeningHoursValue) {
  const formatRange = (range: { open: string; close: string }) => range.open === 'Closed' || range.close === 'Closed' ? 'Closed' : `${range.open}-${range.close}`;
  return `Mon-Fri ${formatRange(value.weekdays)}; Sat-Sun ${formatRange(value.weekend)}`;
}
