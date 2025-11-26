import { originDT, COLUMN_WIDTH } from './constants.js'
import { DateTime } from 'luxon'
import { get } from 'svelte/store'
import { timestampsColumnWidth, pixelsPerHour } from './store.js'

export function jumpToToday (node = document.getElementById('scroll-parent')) {
  const now = DateTime.now()
  const todayIndex = now.startOf('day').diff(originDT, 'days').days

  node.scrollTo({
    left: todayIndex * COLUMN_WIDTH - get(timestampsColumnWidth),
    top: (now.hour + now.minute / 60) * get(pixelsPerHour),
    behavior: 'instant'
  })
}