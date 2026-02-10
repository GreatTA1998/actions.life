const { defineString, defineSecret } = require('firebase-functions/params')
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { google } = require('googleapis')
const { getFirestore } = require('firebase-admin/firestore')

const GOOGLE_CLIENT_ID = defineString('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = defineSecret('GOOGLE_CLIENT_SECRET')

const db = getFirestore('schema-compliant') // cursor bot says first argument is app, second is a string ID. It works for now so we won't change it.

function createAuthClient (redirectUri = 'postmessage') {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID.value(),
    GOOGLE_CLIENT_SECRET.value(),
    redirectUri
  )
}

exports.exchangeGoogleCode = onCall({ cors: true, secrets: [GOOGLE_CLIENT_SECRET] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')

  const { code, redirect_uri } = request.data // need the newly added account too
  const authClient = createAuthClient(redirect_uri)

  try {
    const { tokens } = await authClient.getToken(code)
    
    const ticket = await authClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID.value()
    })
    
    const payload = ticket.getPayload()
    const googleUserId = payload.sub
    const googleEmail = payload.email

    const ref = db.doc(`users/${request.auth.uid}/googleAccounts/${googleUserId}`)
     
    // TO-DO: use factory functions instead of misusing Zod
    await ref.set({
      email: googleEmail,
      id: googleUserId,
      refreshToken: { 
        value: tokens.refresh_token,
        lastUsed: '' // after 6 months of inactivity
      },
      accessToken: {
        value: tokens.access_token,
        expiryDate: tokens.expiry_date // 1 hour after issuance
      },
      scope: tokens.scope,
      selectedCalIDs: [],
      opacity: 0.9
    }, { merge: true })

    return { success: true, googleUserId, email: googleEmail }
  } catch (error) {
    console.error('Error exchanging token:', error);
    throw new HttpsError('internal', 'Failed to exchange authorization code', error.message);
  }
})

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
