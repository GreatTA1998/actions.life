import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calendarFocusMinutes, calendarScrollOffset, parseMinutes } from '../dates';

test('calendarFocusMinutes keeps 09:00 visible when the first event is later', () => {
  assert.equal(calendarFocusMinutes([]), 9 * 60);
  assert.equal(calendarFocusMinutes(['13:51']), 9 * 60);
  assert.equal(calendarFocusMinutes(['09:00', '13:51']), 9 * 60);
  assert.equal(calendarFocusMinutes(['07:15', '13:51']), parseMinutes('07:15'));
  assert.equal(calendarFocusMinutes(['22:30']), 9 * 60);
  assert.equal(calendarFocusMinutes(['00:40']), 9 * 60);
});

test('calendarScrollOffset pins 08:00 at the top so 09:00 stays visible in a short split', () => {
  assert.equal(calendarScrollOffset([]), 2 * 50 - 8);
  assert.equal(calendarScrollOffset(['13:51']), calendarScrollOffset([]));
  assert.ok(calendarScrollOffset([]) < 3 * 50 - 8);
});
