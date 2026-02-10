import { cloudFunction } from '$lib/utils/cloudFunctions'
import { user, allAccounts, cals, googleEventsByDate } from '$lib/store'
import { get } from 'svelte/store'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '$lib/db/init'
import { DateTime } from 'luxon'

export async function fetchAccountsAndCalendars () {
  // quickfix for localhost refetching duplicates
  cals.set({})
  googleEventsByDate.set({})

  return new Promise(resolve => {
    let firstTime = true

    const ref = collection(db, `/users/${get(user).uid}/googleAccounts`)
    onSnapshot(ref, async (snapshot) => {
      // danger: if we hydrate doc id here, it'd override account id, perhaps rename it to uid in the future
      allAccounts.set(snapshot.docs.map(doc => ({ ...doc.data() })))
      if (firstTime) { // danger, won't react to newly added accounts
        firstTime = false
        const promises = []
        for (const account of get(allAccounts)) {
          promises.push(
            cloudFunction('fetchGoogleCalendars',{ refreshToken: account.refreshToken.value })
              .then(result => cals.update(C => {
                C[account.id] = result.data.calendars
                return C 
              }))
          )
        }
        await Promise.all(promises)
        resolve()
      }
    })
  })
}

export async function getAllGCalEvents (startDT, endDT) {
  const accounts = get(allAccounts)
  const calendars = get(cals)
   
  for (const account of accounts) {
    if (account.selectedCalIDs.length > 0) {
      helper(
        startDT, 
        endDT, 
        account.selectedCalIDs, 
        calendars[account.id], 
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
  return {
    opacity,
    id: event.id,
    calendarId: event.calendarId,
    summary: event.summary,
    start: event.start, // { dateTime: ..., timeZone: ... }
    end: event.end,
    backgroundColor: calMap.get(event.calendarId).backgroundColor,
    foregroundColor: calMap.get(event.calendarId).foregroundColor,
    description: event.description
  }
}

function empty () {
  return { hasStartTime: [], allDay: [] }
}

