import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { formatOpeningHours, parseOpeningHours } from './opening-hours';

describe('opening hours helpers', () => {
  test('parses weekday and weekend ranges', () => {
    assert.deepEqual(parseOpeningHours('Mon-Fri 09:00-21:00; Sat-Sun 10:00-22:00'), {
      weekdays: { open: '09:00', close: '21:00' },
      weekend: { open: '10:00', close: '22:00' }
    });
  });

  test('formats closed ranges', () => {
    assert.equal(formatOpeningHours({ weekdays: { open: 'Closed', close: 'Closed' }, weekend: { open: '10:00', close: '22:00' } }), 'Mon-Fri Closed; Sat-Sun 10:00-22:00');
  });
});
