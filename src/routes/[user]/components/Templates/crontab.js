export function crontabToState (crontab) {
  if (getPeriod(crontab) === 'yearly') {
    const parts = crontab?.split(' ') || []
    const selectedDays = (parts[2] || '').split(',').filter(d => d).map(Number)
    const selectedMonths = (parts[3] || '').split(',').filter(m => m).map(Number)
    return {
      type: 'yearly',
      selectedDays,
      selectedMonths
    }
  }
  else if (getPeriod(crontab) === 'monthly') {
    const selectedDays = crontab.split(' ')[2].split(',').map(Number).filter(d => !isNaN(d)).sort((a, b) => a - b)
    return {
      type: 'monthlyTypeI',
      selectedDays
    }
  }
  else if (getPeriod(crontab) === 'weekly') {
    let selectedDays = []
    const weekdaysPart = crontab?.split(' ')[4]
    if (weekdaysPart) {
      // Convert from crontab format (1-7, where 1 is Monday, 7 is Sunday)
      // to our format (0-6, where 0 is Sunday)
      selectedDays = weekdaysPart.split(',')
        .map(day => parseInt(day))
        .map(day => day === 7 ? 0 : day)
        .filter(day => !isNaN(day) && day >= 0 && day <= 6)
    } 
    return {
      type: 'weekly',
      selectedDays
    }
  }
  else {
    return {
      type: 'quick',
      selectedDays: []
    }
  }
}

export function getPeriod (crontab) {
  if (crontab === '') return 'quick'
  const parts = crontab.split(' ')
  if (parts.length !== 5) throw new Error('Invalid crontab format', crontab, parts)
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
  if (dayOfMonth !== '*' && month !== '*' && dayOfWeek === '*') return 'yearly'
  if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') return 'monthly'
  if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') return 'weekly'
  console.error('Invalid crontab format', crontab)
  return 'unknown'
}