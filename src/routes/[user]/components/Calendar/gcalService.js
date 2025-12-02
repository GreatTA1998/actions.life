import { fetchGoogleEvents } from '$lib/utils/cloudFunctions'
import { googleEventsByDate } from './service.js'
import { user } from '$lib/store'
import { get } from 'svelte/store'

export async function getGoogleEvents (startDT, endDT) {
  try {
    const allCalendars = get(user).googleCalendars || []
    
    if (allCalendars.length === 0) return

    const selectedIds = get(user).selectedGoogleCalendarIds ?? allCalendars.map(cal => cal.id)
    const calendars = allCalendars.filter(cal => selectedIds.includes(cal.id))

    if (calendars.length === 0) return

    const result = await fetchGoogleEvents({ 
      timeMin: startDT.startOf('day').toISO(),
      timeMax: endDT.endOf('day').toISO(),
      calendarIds: calendars.map(cal => cal.id) 
    })
    
    if (result.data && result.data.events) {
      const events = result.data.events
      const eventsByDate = {}
      
      const calMap = new Map(calendars.map(cal => [cal.id, cal]))
      
      for (const event of events) {
        // Filter out cancelled events or those without dates
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
          backgroundColor: calMap.get(event.calendarId).backgroundColor || '#4285F4',
          foregroundColor: calMap.get(event.calendarId).foregroundColor || 'white',
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

