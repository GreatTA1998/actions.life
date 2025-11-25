import { calEarliestHHMM } from './timestamps.js'
import { originDT, COLUMN_WIDTH } from './constants.js'
import { DateTime } from 'luxon'
import { get } from 'svelte/store'
import { timestampsColumnWidth } from './store.js'

export function jumpToToday (node = document.getElementById('scroll-parent')) {
  const now = DateTime.now()
  const todayIndex = now.startOf('day').diff(originDT, 'days').days
  const todayX = todayIndex * COLUMN_WIDTH
  
  const [hour, minute] = get(calEarliestHHMM).split(':').map(Number)
  const dayStart = now.set({ hour, minute })
  const minutesSinceDayStart = now.diff(dayStart, 'minutes').minutes
  const pixelsPerMinute = 1 // This value should match the one in TimeIndicator
  const timeY = minutesSinceDayStart * pixelsPerMinute

  node.scrollTo({
    left: todayX - get(timestampsColumnWidth),
    top: timeY,
    behavior: 'instant'
  })
}