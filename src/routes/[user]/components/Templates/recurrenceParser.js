/**
 * Parses recurrence rule string (rrStr) to determine the recurrence type and extract relevant data
 * @param {string} rrStr - The recurrence rule string to parse
 * @returns {Object} An object containing the recurrence type and parsed data
 */
export function parseRecurrenceString(rrStr) {
  if (!rrStr) {
    return {
      type: 'weekly',
      weeklyData: { selectedDays: [] },
      monthlyData: { selectedDays: [] },
      yearlyData: { selectedMonths: [], selectedDays: [] }
    }
  }
  
  const rrLower = rrStr.toLowerCase()
  let result = {
    type: 'weekly',
    weeklyData: { selectedDays: [] },
    monthlyData: { selectedDays: [] },
    yearlyData: { selectedMonths: [], selectedDays: [] }
  }
  
  // First check for explicit frequency declarations
  if (rrLower.includes('freq=monthly')) {
    result.type = 'monthly'
    
    // Extract days from rrStr (e.g., "BYMONTHDAY=1,15" -> [1,15])
    const dayMatch = rrLower.match(/bymonthday=([0-9,]+)/i)
    if (dayMatch && dayMatch[1]) {
      result.monthlyData.selectedDays = dayMatch[1].split(',').map(d => parseInt(d))
    }
  } else if (rrLower.includes('freq=yearly')) {
    result.type = 'yearly'
    
    // Extract months from rrStr (e.g., "BYMONTH=1,4,7,10" -> [1,4,7,10])
    const monthMatch = rrLower.match(/bymonth=([0-9,]+)/i)
    if (monthMatch && monthMatch[1]) {
      result.yearlyData.selectedMonths = monthMatch[1].split(',').map(m => parseInt(m))
    }
    
    // Also extract days for yearly recurrence
    const dayMatch = rrLower.match(/bymonthday=([0-9,]+)/i)
    if (dayMatch && dayMatch[1]) {
      result.yearlyData.selectedDays = dayMatch[1].split(',').map(d => parseInt(d))
    }
  } else if (rrLower.includes('freq=weekly')) {
    result.type = 'weekly'
    
    // Extract days from rrStr (e.g., "BYDAY=MO,WE,FR" -> [1,3,5])
    // Mapping: SU=0, MO=1, TU=2, WE=3, TH=4, FR=5, SA=6
    const dayMatch = rrLower.match(/byday=([a-z,]+)/i)
    if (dayMatch && dayMatch[1]) {
      const dayMap = { su: 0, mo: 1, tu: 2, we: 3, th: 4, fr: 5, sa: 6 }
      result.weeklyData.selectedDays = dayMatch[1].split(',')
        .map(day => dayMap[day.toLowerCase()])
        .filter(day => day !== undefined)
    }
  } else {
    // Fall back to checking specific parts if FREQ is not explicitly stated
    if (rrLower.includes('bymonth')) {
      result.type = 'yearly'
      
      const monthMatch = rrLower.match(/bymonth=([0-9,]+)/i)
      if (monthMatch && monthMatch[1]) {
        result.yearlyData.selectedMonths = monthMatch[1].split(',').map(m => parseInt(m))
      }
      
      const dayMatch = rrLower.match(/bymonthday=([0-9,]+)/i)
      if (dayMatch && dayMatch[1]) {
        result.yearlyData.selectedDays = dayMatch[1].split(',').map(d => parseInt(d))
      }
    } else if (rrLower.includes('bymonthday')) {
      result.type = 'monthly'
      
      const dayMatch = rrLower.match(/bymonthday=([0-9,]+)/i)
      if (dayMatch && dayMatch[1]) {
        result.monthlyData.selectedDays = dayMatch[1].split(',').map(d => parseInt(d))
      }
    } else {
      // Default to weekly
      result.type = 'weekly'
      
      const dayMatch = rrLower.match(/byday=([a-z,]+)/i)
      if (dayMatch && dayMatch[1]) {
        const dayMap = { su: 0, mo: 1, tu: 2, we: 3, th: 4, fr: 5, sa: 6 }
        result.weeklyData.selectedDays = dayMatch[1].split(',')
          .map(day => dayMap[day.toLowerCase()])
          .filter(day => day !== undefined)
      }
    }
  }
  
  return result
}

/**
 * Converts weekly recurrence data to crontab format for display in WeekRhythm
 * @param {Array} selectedDays - Array of selected day indices (0-6, where 0 is Sunday)
 * @returns {string} Crontab string for weekly recurrence
 */
export function weeklyCrontabFromSelectedDays(selectedDays) {
  if (!selectedDays || !selectedDays.length) return '* * * * *'
  
  // Convert day indices to crontab format (1-7, where 1 is Monday and 7 is Sunday)
  // Adjusting from 0-based (0=Sunday) to crontab format (1=Monday, 7=Sunday)
  const adjustedDays = selectedDays.map(day => day === 0 ? 7 : day)
    .sort((a, b) => a - b)
    .join(',')
  
  return `0 0 * * ${adjustedDays}`
}

/**
 * Converts monthly recurrence data to crontab format for display in MonthRhythm
 * @param {Array} selectedDays - Array of selected day indices (1-31)
 * @returns {string} Crontab string for monthly recurrence
 */
export function monthlyCrontabFromSelectedDays(selectedDays) {
  if (!selectedDays || !selectedDays.length) return '0 0 * * *'
  
  const days = selectedDays.sort((a, b) => a - b).join(',')
  return `0 0 ${days} * *`
}

/**
 * Converts yearly recurrence data to crontab format for display in YearRhythm
 * @param {Array} selectedMonths - Array of selected month indices (1-12)
 * @param {Array} selectedDays - Array of selected day indices (1-31)
 * @returns {string} Crontab string for yearly recurrence
 */
export function yearlyCrontabFromData(selectedMonths, selectedDays) {
  if (!selectedMonths || !selectedMonths.length) return '0 0 * * *'
  
  // For proper display, match days with months if possible
  let days
  if (selectedDays && selectedDays.length >= selectedMonths.length) {
    // Use corresponding days for each month
    days = selectedDays.slice(0, selectedMonths.length).join(',')
  } else if (selectedDays && selectedDays.length > 0) {
    // Reuse the available days
    days = selectedDays[0].toString()
  } else {
    // Default to 1st of the month
    days = '1'
  }
  
  const months = selectedMonths.sort((a, b) => a - b).join(',')
  return `0 0 ${days} ${months} *`
} 