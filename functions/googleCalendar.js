const { defineString, defineSecret } = require('firebase-functions/params')
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { google } = require('googleapis')

const GOOGLE_CLIENT_ID = defineString('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = defineSecret('GOOGLE_CLIENT_SECRET')

function createAuthClient (redirectUri = 'postmessage') {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID.value(),
    GOOGLE_CLIENT_SECRET.value(),
    redirectUri
  )
}

exports.exchangeForTokens = onCall({ cors: true, secrets: [GOOGLE_CLIENT_SECRET] }, async (request) => {
  const { authorizationCode, redirect_uri } = request.data
  const authClient = createAuthClient(redirect_uri)
  const { tokens } = await authClient.getToken(authorizationCode)
  const ticket = await authClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: GOOGLE_CLIENT_ID.value() // prevents against Confused Deputy attacks
  })
  const { sub, email } = ticket.getPayload()
  return { tokens, email, id: sub }
})

// Warning: exports.exchangeGoogleCode is still used on beta and main as of 2026-05-27. Deprecate safely on 2026-08-27.

exports.fetchGoogleCalendars = onCall({ cors: true, secrets: [GOOGLE_CLIENT_SECRET] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')
  }
  const { refreshToken } = request.data
  if (!refreshToken) throw new HttpsError('failed-precondition', 'No refresh token')

  const authClient = createAuthClient()
  authClient.setCredentials({ refresh_token: refreshToken })

  const apiClient = google.calendar({ version: 'v3', auth: authClient });

  try {
    const response = await apiClient.calendarList.list({ minAccessRole: 'reader' })
    
    const calendars = (response.data.items || []) // Google Calendar API: the items may be absent if the list is empty. This will throw a TypeError if a user somehow has no calendar entries.
      .map(({ id, summary, backgroundColor, foregroundColor }) => ({ id, summary, backgroundColor, foregroundColor }))
    
    return { calendars }
  } catch (error) {
    console.error('Error fetching calendars:', error);
    throw new HttpsError('internal', 'Failed to fetch calendars', error.message);
  }
})

exports.fetchGoogleEvents = onCall({ cors: true, secrets: [GOOGLE_CLIENT_SECRET] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')

  const { timeMin, timeMax, calendarIds, refreshToken } = request.data

  if (!calendarIds) throw new HttpsError('invalid-argument', 'calendarIds is undefined.')
  if (!refreshToken) throw new HttpsError('invalid-argument', 'refreshToken is required.')

  const authClient = createAuthClient()
  authClient.setCredentials({ refresh_token: refreshToken })

  const apiClient = google.calendar({ version: 'v3', auth: authClient })

  const eventPromises = calendarIds.map(async calendarId => {
    try {
      const response = await apiClient.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      })
      return (response.data.items || []).map(event => ({ ...event, calendarId }))
    } catch (err) {
      console.error(`Error fetching events for calendar ${calendarId}:`, err);
      return []
    }
  })

  const results = await Promise.all(eventPromises)
  return { events: results.flat() }
})
