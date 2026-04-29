import { DateTime } from 'luxon'

import * as rrule from 'rrule' // get around the CommonJS vs ES Module issue
const { RRule, datetime } = rrule

function debug (varName, dt) {
  console.log(`${varName}: ${dt.toFormat('EEE MM-dd HH:mm')} ${dt.zoneName}`)
}

function rrFloat (dt) {
  const float = dt.setZone('UTC', { keepLocalTime: true })
  return datetime(float.year, float.month, float.day) // 00:00 UTC (displayed as <offset> local time)
}

export function generateRecurrenceDTs ({ startDT, endDT, rrStr }) {
  const rule = new RRule({ ...RRule.parseString(rrStr), dtstart: rrFloat(startDT) })
  const jsDates = rule.between(
    rrFloat(startDT),
    rrFloat(endDT),
    true // includes endDT
  )
  const results = jsDates.map(date => {
    // from rrule's README (seriously)
    return DateTime.fromJSDate(date).toUTC().setZone('local', { keepLocalTime: true })
  })
  return results
}

export function getPreviewSpan ({ rrStr }) {
  const kind = periodicity(rrStr)

  if (kind === 'yearly') return 365 * 2
  else if (kind === 'monthly') return 31 * 2
  else return 7 * 2
}

export function periodicity (rrStr) {
  if (!rrStr) return 'weekly'
  const lower = rrStr.toLowerCase()

  if (lower.includes('freq=monthly')) return 'monthly'
  else if (lower.includes('freq=yearly')) return 'yearly'
  else return 'weekly'
}

export function parse (rrStr) {
  if (!rrStr) return null
  else if (rrStr.includes('FREQ=WEEKLY')) return parseWeekly(rrStr)
  else if (rrStr.includes('FREQ=MONTHLY')) {
    if (rrStr.includes('BYMONTHDAY')) return parseMonthlyTypeI(rrStr)
    else if (rrStr.includes('BYDAY')) return parseMonthlyTypeII(rrStr)
  }
  else if (rrStr.includes('FREQ=YEARLY')) return parseYearly(rrStr)
}

export function parseWeekly (rrStr) {
  const result = rrStr?.match(/BYDAY=([^;]*)/)
  return result ? result[1].split(',') : []
}

export function parseMonthlyTypeI (rrStr) {
  const match = rrStr.match(/BYMONTHDAY=([^;]*)/)
  if (!match) return []
  return match[1].split(',').map(Number)
}

export function parseMonthlyTypeII (rrStr) {
  const match = rrStr.match(/BYDAY=([^;]*)/)
  if (!match) return { weeks: [], days: [] }

  const weeks = new Set()
  const days = new Set()

  for (const part of match[1].split(',')) {
    const m = part.match(/([+\-]\d+)([A-Z]{2})/)
    if (m) {
      weeks.add(parseInt(m[1]))
      days.add(m[2])
    }
  }
  return { weeks: [...weeks].sort(), days: [...days] }
}

export function parseYearly (rrStr) {
  const bymonthdayMatch = rrStr.match(/BYMONTHDAY=(\d+)/)
  const bymonthMatch = rrStr.match(/BYMONTH=(\d+)/)
  
  if (bymonthdayMatch && bymonthMatch) {
    const day = parseInt(bymonthdayMatch[1])
    const month = parseInt(bymonthMatch[1])
    const mmdd = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`
    return { mmdd, year: new Date().getFullYear().toString() }
  }
}

export const nth = [, '1st', '2nd', '3rd', '4th'] 