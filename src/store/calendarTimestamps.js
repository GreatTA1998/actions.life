
import { writable, derived, get } from 'svelte/store'
import { user } from './userStore.js'

export const timestamps = writable([])
// TO-DO: initialize default properly at the database level
export const calEarliestHHMM = writable('00:00')
export const calLastHHMM = writable('23:59')
export const totalMinutes = writable(1000)

// Set up the subscription after initialization
user.subscribe($user => {
  if (!$user) {
    timestamps.set([])
    return
  }
  calEarliestHHMM.set($user.calEarliestHHMM || '00:00')
  calLastHHMM.set($user.calLastHHMM || '23:59')

  timestamps.set(
    getTimestamps({ 
      calEarliestHHMM: get(calEarliestHHMM), 
      calLatestHHMM: get(calLastHHMM) 
    })
  )

  totalMinutes.set(getMinutesDiff({ calEarliestHHMM: get(calEarliestHHMM), calLatestHHMM: get(calLastHHMM) }))
})

/**
 * Given calEarliestHHMM and calLatestHHMM returns:
 * 1. The timestamps
 * 2. The number of minutes between calEarliestHHMM and calLatestHHMM (to determine the height of columns etc.)
 */

// given calEarliestHHMM and calLatestHHMM, generate the invisible rectangles
export function getTimestamps({ calEarliestHHMM, calLatestHHMM }) {
  const timestamps = []
  
  const [startHour, startMinute] = calEarliestHHMM.split(':').map(Number)
  const [endHour, endMinute] = calLatestHHMM.split(':').map(Number)
  
  // Add initial timestamp if it's not on the hour
  if (startMinute !== 0) {
    timestamps.push(calEarliestHHMM)
  }
  
  // Add hourly timestamps
  let currentHour = startMinute > 0 ? startHour + 1 : startHour;
  while (currentHour <= endHour) {
    const timestamp = `${currentHour.toString().padStart(2, '0')}:00`
    timestamps.push(timestamp)
    currentHour++
  }
  
  // Add final timestamp if it's not on the hour
  if (endMinute !== 0) {
    timestamps.push(calLatestHHMM)
  }

  return timestamps
}

export function getMinutesDiff({ calEarliestHHMM, calLatestHHMM }) {
  const [startHour, startMinute] = calEarliestHHMM.split(':').map(Number)
  const [endHour, endMinute] = calLatestHHMM.split(':').map(Number)
  return (endHour - startHour) * 60 + (endMinute - startMinute)
}