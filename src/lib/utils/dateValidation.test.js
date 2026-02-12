import { describe, it, expect } from 'vitest'
import { isValidISODate } from './dateValidation.js'

describe('isValidISODate', () => {
  it('accepts empty strings for optional dates', () => {
    expect(isValidISODate('')).toBe(true)
  })

  it('accepts valid ISO calendar dates', () => {
    expect(isValidISODate('2024-02-29')).toBe(true)
    expect(isValidISODate('2026-12-31')).toBe(true)
  })

  it('rejects impossible dates that Date() would auto-correct', () => {
    expect(isValidISODate('2024-02-31')).toBe(false)
    expect(isValidISODate('2023-02-29')).toBe(false)
    expect(isValidISODate('2026-13-01')).toBe(false)
    expect(isValidISODate('2026-00-10')).toBe(false)
  })

  it('rejects non ISO-formatted strings', () => {
    expect(isValidISODate('2026-2-1')).toBe(false)
    expect(isValidISODate('02/01/2026')).toBe(false)
  })
})
