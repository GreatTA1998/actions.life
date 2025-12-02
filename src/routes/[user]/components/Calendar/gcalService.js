import { fetchGoogleEvents } from '$lib/utils/cloudFunctions'
import { googleEventsByDate } from './service.js'

export async function getGoogleEvents (startDT, endDT) {
  try {
    const timeMin = startDT.startOf('day').toISO()
    const timeMax = endDT.endOf('day').toISO()
    const result = await fetchGoogleEvents({ timeMin, timeMax })
    
    if (result.data && result.data.events) {
      const events = result.data.events
      const eventsByDate = {}
      
      for (const event of events) {
        // Filter out cancelled events or those without dates
        if (event.status === 'cancelled') continue
        
        // Only include timed events (not all-day events)
        if (!event.start?.dateTime || !event.end?.dateTime) continue
        
        const startDate = event.start.dateTime.split('T')[0] // YYYY-MM-DD
        
        if (!eventsByDate[startDate]) eventsByDate[startDate] = []
        eventsByDate[startDate].push({
          id: event.id,
          summary: event.summary,
          start: event.start, // { dateTime: ..., timeZone: ... }
          end: event.end,
          colorId: event.colorId, // Google color ID
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

