import { cloudFunction } from '$lib/utils/cloudFunctions'
import { user, googleEventsByDate } from '$lib/store'
import { get, writable } from 'svelte/store'
import { DateTime } from 'luxon'
import { getFirestoreCollection } from '$lib/db/helpers.js'

export const allAccounts = writable([])

export async function getAllGCalEvents (startDT, endDT) {
  const gcalAccounts = await getFirestoreCollection(`/users/${get(user).uid}/googleAccounts`) 
  for (const account of gcalAccounts) {
    if (account.selectedCalIDs.length > 0) {
      helper(
        startDT, 
        endDT, 
        account.selectedCalIDs, 
        account.allCals, 
        account.refreshToken.value,
        account.opacity
      )
    }
  }
}

export async function helper (startDT, endDT, calendarIds, calArr, refreshToken, opacity = 0.4) {
  try {  
    const result = await cloudFunction('fetchGoogleEvents', { 
      timeMin: startDT.startOf('day').toISO(),
      timeMax: endDT.endOf('day').toISO(),
      calendarIds,
      refreshToken
    })

    const dtsInRange = []
    let current = startDT
    while (current <= endDT) {
      dtsInRange.push(current.toFormat('yyyy-MM-dd'))
      current = current.plus({ days: 1 })
    }

    if (result.data?.events) {
      const dict = {}
      for (const dt of dtsInRange) {
        dict[dt] = empty()
      }
      const calMap = new Map(calArr.map(cal => [cal.id, cal]))
      
      for (const event of result.data.events) { // this is wrong, multi-day events can have start and end times see Feb 26 18:00 --> March 4 21:00, re-think the logic
        if (event.start.date && !event.start.dateTime) {
          const d1 = DateTime.fromISO(event.start.date)
          const d2 = DateTime.fromISO(event.end.date) // probably a conversion error due to implicit timezone conversions, causing an off by 1 bug i.e. event ends at 9th instead of 8th
          let current = d1
          while (current <= d2) { 
            const yyyyMMdd = current.toFormat('yyyy-MM-dd')
            if (!dict[yyyyMMdd]) dict[yyyyMMdd] = empty() // since all day event's end interval can exceed our API fetch range
            dict[yyyyMMdd].allDay.push(gcalTask(event, calMap, opacity)) 

            current = current.plus({ days: 1 })
          }
        }
        else if (event.start.dateTime && event.end.dateTime) {
          const yyyyMMdd = event.start.dateTime.split('T')[0]
          if (!dict[yyyyMMdd]) dict[yyyyMMdd] = empty() // quickfix for multiday events spanning and matching in previous intervals
          dict[yyyyMMdd].hasStartTime.push(gcalTask(event, calMap, opacity))
        }
      }
      googleEventsByDate.update(current => {
        for (const dt of dtsInRange) {
          if (!current[dt]) current[dt] = empty()
          // composable, since multiple accounts will overwrite the same date period
          current[dt].hasStartTime = [...current[dt].hasStartTime, ...dict[dt].hasStartTime]
          current[dt].allDay = [...current[dt].allDay, ...dict[dt].allDay]
        }
        return current
      })
    }
  } catch (e) {
    console.error("Failed to fetch Google Events", e)
    throw e // Fail fast - let caller handle if needed
  }
}

function gcalTask (event, calMap, opacity) {
  const { backgroundColor, foregroundColor } = calMap.get(event.calendarId)
  return {
    opacity,
    backgroundColor,
    foregroundColor,
    ...event
  }
}

function empty () {
  return { hasStartTime: [], allDay: [] }
}

