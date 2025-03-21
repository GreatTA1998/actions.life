import { writable, derived, get } from 'svelte/store'
import { user } from '/src/store/userStore.js'

export const timestamps = writable([])
// TO-DO: initialize default properly at the database level
export const calEarliestHHMM = writable('00:00')
export const calLastHHMM = writable('23:59')
export const totalMinutes = writable(1000)
export const calSnapInterval = writable(5)

// Set up the subscription after initialization
user.subscribe($user => {
  if (!$user) {
    timestamps.set([])
    return
  }
  calEarliestHHMM.set($user.calEarliestHHMM || '00:00')
  calLastHHMM.set($user.calLastHHMM || '23:59')
  calSnapInterval.set($user.calSnapInterval || 5)

  timestamps.set(
    getTimestamps({ 
      calEarliestHHMM: get(calEarliestHHMM), 
      calLatestHHMM: get(calLastHHMM) 
    })
  )

  totalMinutes.set(
    getMinutesDiff({ 
      calEarliestHHMM: get(calEarliestHHMM), 
      calLatestHHMM: get(calLastHHMM) 
    })
  )
})

// given calEarliestHHMM and calLatestHHMM, generate the invisible rectangles
export function getTimestamps({ calEarliestHHMM, calLatestHHMM }) {
  const timestamps = []
  
  const [startHour, startMinute] = calEarliestHHMM.split(':').map(Number)
  const [endHour, endMinute] = calLatestHHMM.split(':').map(Number)
  
  // Add initial timestamp if it's not on the hour
  if (startMinute !== 0) {
    timestamps.push(calEarliestHHMM)
  }
  
  // Calculate start and end in total minutes since midnight
  const startTotalMins = startHour * 60 + startMinute
  let endTotalMins = endHour * 60 + endMinute

  // Adjust end time if it crosses midnight
  if (endTotalMins <= startTotalMins) {
    endTotalMins += 24 * 60
  }
  
  // Start at the next hour mark after start time
  let currentHourMins = Math.ceil(startTotalMins / 60) * 60
  
  // Add all hourly timestamps between start and end
  while (currentHourMins < endTotalMins) {
    // Convert back to HH:MM format, handling midnight crossing with modulo
    const hour = Math.floor(currentHourMins / 60) % 24
    timestamps.push(`${hour.toString().padStart(2, '0')}:00`)
    currentHourMins += 60
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
  
  let totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute)
  
  // If result is negative or zero (same times), it means we crossed midnight or need a full day
  if (totalMinutes <= 0) {
    totalMinutes += 24 * 60 // Add 24 hours worth of minutes
  }
  
  return totalMinutes
} 