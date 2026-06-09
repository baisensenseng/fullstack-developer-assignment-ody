import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { buildOrdersCsv, escapeCsvCell, formatStatusLabel, getStatusTone, toggleFilterValue } from './order-formatters';

describe('order formatters', () => {
  test('formats status labels and tones', () => {
    assert.equal(formatStatusLabel('start_preparing'), 'start preparing');
    assert.equal(getStatusTone('ready'), 'success');
    assert.equal(getStatusTone('cancelled'), 'error');
    assert.equal(getStatusTone('pending'), 'warning');
  });

  test('escapes CSV cells with commas and quotes', () => {
    assert.equal(escapeCsvCell('Bistro, Table "A"'), '"Bistro, Table ""A"""');
  });

  test('builds an orders CSV document', () => {
    const csv = buildOrdersCsv([
      {
        id: 'order-1',
        orderNumber: 'OD-1',
        status: 'pending',
        fulfillmentType: 'pickup',
        totalCents: 1299,
        itemCount: 2,
        channel: 'dashboard',
        location: 'ody-bistro',
        availableActions: ['accept'],
        createdAt: '2026-06-09T10:00:00.000Z',
        updatedAt: '2026-06-09T10:00:00.000Z',
        customer: { id: 'customer-1', name: 'Ava Stone', email: 'ava@example.com', phone: '+1 555 111 2222' }
      }
    ]);

    assert.match(csv, /Order,Customer,Email,Phone,Items,Type,Status,Total,Updated/);
    assert.match(csv, /OD-1,Ava Stone,ava@example.com/);
    assert.match(csv, /\$12\.99/);
  });

  test('toggles filter values', () => {
    let values = ['pickup'];
    toggleFilterValue(values, 'delivery', (next) => { values = next; });
    assert.deepEqual(values, ['pickup', 'delivery']);
    toggleFilterValue(values, 'pickup', (next) => { values = next; });
    assert.deepEqual(values, ['delivery']);
  });
});
