import { describe, it, expect } from 'vitest'
import {
  periodicity,
  getPreviewSpan,
  toWeeklyIndices,
  parseMonthlyTypeII,
  parseYearly
} from './rrule.js'

describe('rrule helpers', () => {
  it('infers periodicity and preview span', () => {
    expect(periodicity('FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=1')).toBe('yearly')
    expect(getPreviewSpan({ rrStr: 'FREQ=MONTHLY;BYMONTHDAY=12' })).toBe(62)
    expect(getPreviewSpan({ rrStr: 'FREQ=WEEKLY;BYDAY=MO' })).toBe(14)
  })

  it('parses weekly day indices in Monday-first order', () => {
    expect(toWeeklyIndices('FREQ=WEEKLY;BYDAY=TU,FR')).toEqual([2, 5])
    expect(toWeeklyIndices('FREQ=WEEKLY')).toEqual([])
  })

  it('parses monthly nth-weekday rules', () => {
    const result = parseMonthlyTypeII('FREQ=MONTHLY;BYDAY=+1MO,+1WE,+2MO')
    expect(Array.from(result.weekPos)).toEqual(['first', 'second'])
    expect(result.selectedWeekdays).toEqual(['monday', 'wednesday'])
  })

  it('parses yearly month/day rules', () => {
    expect(parseYearly('FREQ=YEARLY;BYMONTH=4;BYMONTHDAY=3')).toMatchObject({
      mmdd: '04/03'
    })
  })
})
