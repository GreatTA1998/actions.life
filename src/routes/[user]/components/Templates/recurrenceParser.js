import { rruleToWeekday, positionToOccurrence } from './components/TemplatePopup/rruleUtils.js'

export function getPeriodicity (rrStr) {
  if (!rrStr) return 'weekly'
  
  const lower = rrStr.toLowerCase()
  if (lower.includes('freq=monthly')) return 'monthly'
  if (lower.includes('freq=yearly')) return 'yearly'
  else {
    return 'weekly'
  }
}

export function parseRecurrenceString (rrStr) { 
  if (!rrStr) return 
  const rr = rrStr.toLowerCase() // be careful between rrStr and rr

  if (rr.includes('freq=weekly')) return toWeeklyIndices(rrStr) 
  else if (rr.includes('freq=monthly')) {
    if (rr.includes('bymonthday')) return parseMonthlyTypeI(rrStr)
    else if (rr.includes('byday')) return parseMonthlyTypeII(rrStr)
  } 
  else if (rr.includes('freq=yearly')) return parseYearly(rrStr)
}

export function toWeeklyIndices (rrStr) {
  const days = [, 'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] // note: this is not DRY
  const dayParts = rrStr?.match(/(?<=BYDAY=)[^;]*/) // BYDAY=TU,FR becomes TU,FR
  if (!dayParts) return []
  else {
    return dayParts[0].split(',').map(day => days.indexOf(day))
  }
}

export function parseMonthlyTypeI (rrStr) {
  const selectedDays = new Set()
  const bymonthdayMatch = rrStr.match(/BYMONTHDAY=([^;]*)/)
  if (bymonthdayMatch) {
    const days = bymonthdayMatch[1].split(',').map(Number)
    days.forEach(day => selectedDays.add(day))
  }
  return selectedDays
}

export function parseMonthlyTypeII (rrStr) {
  const weekPos = new Set()
  const selectedWeekdays = []

  const bydayMatch = rrStr.match(/BYDAY=([^;]*)/)
  if (bydayMatch) {
    const bydayParts = bydayMatch[1].split(',')
    
    const weekdaysFound = new Set()
    
    bydayParts.forEach(part => {
      const posMatch = part.match(/([+\-]\d+)([A-Z]{2})/)
      if (posMatch) {
        const pos = posMatch[1]
        const day = posMatch[2]
        
        // Convert position to occurrence id
        const occId = positionToOccurrence[pos]
        if (occId) {
          weekPos.add(occId)
        }
        
        // Add weekday to our selected weekdays
        const weekdayId = rruleToWeekday[day]
        if (weekdayId && !weekdaysFound.has(weekdayId)) {
          weekdaysFound.add(weekdayId)
          selectedWeekdays.push(weekdayId)
        }
      }
    })
    selectedWeekdays.sort()
    
    return { weekPos, selectedWeekdays }
  }
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