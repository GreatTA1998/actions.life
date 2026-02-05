import { fetchGoogleEvents, fetchGoogleCalendars } from '$lib/utils/cloudFunctions'
import { googleEventsByDate } from './service.js'
import { user } from '$lib/store'
import { allAccounts, cals } from '$lib/store'
import { get } from 'svelte/store'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '$lib/db/init'

export async function fetchAccountsAndCalendars () {
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
            fetchGoogleCalendars({ refreshToken: account.refreshToken.value })
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

export async function getGoogleEvents (startDT, endDT) {
  const accounts = get(allAccounts)
  const calendars = get(cals)
   
  for (const account of accounts) {
    if (account.selectedCalIDs.length > 0) {
      helper(startDT, endDT, account.selectedCalIDs, calendars[account.id], account.refreshToken.value)
    }
  }
}

export async function helper (startDT, endDT, calendarIds, calArr, refreshToken) {
  try {  
    const result = await fetchGoogleEvents({ 
      timeMin: startDT.startOf('day').toISO(),
      timeMax: endDT.endOf('day').toISO(),
      calendarIds,
      refreshToken
    })
    
    if (result.data?.events) {
      const { events } = result.data
      const eventsByDate = {}
      
      const calMap = new Map(calArr.map(cal => [cal.id, cal]))
      
      for (const event of events) {
        if (event.status === 'cancelled') continue
        
        // Only include timed events (not all-day events)
        if (!event.start?.dateTime || !event.end?.dateTime) continue
        
        const startDateISO = event.start.dateTime.split('T')[0] // YYYY-MM-DD

        if (!eventsByDate[startDateISO]) eventsByDate[startDateISO] = []
        eventsByDate[startDateISO].push({
          id: event.id,
          summary: event.summary,
          start: event.start, // { dateTime: ..., timeZone: ... }
          end: event.end,
          backgroundColor: calMap.get(event.calendarId).backgroundColor,
          foregroundColor: calMap.get(event.calendarId).foregroundColor,
          description: event.description,
          location: event.location,
          htmlLink: event.htmlLink
        })
      }

      googleEventsByDate.update(current => {
        return { ...current, ...eventsByDate }
      })
    }
  } catch (e) {
    console.error("Failed to fetch Google Events", e)
    throw e // Fail fast - let caller handle if needed
  }
}

