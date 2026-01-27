const { defineString, defineSecret } = require('firebase-functions/params')
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { google } = require('googleapis')
const { getFirestore } = require('firebase-admin/firestore')

const GOOGLE_CLIENT_ID = defineString('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = defineSecret('GOOGLE_CLIENT_SECRET')

const db = getFirestore('schema-compliant');

function createAuthClient (redirectUri = 'postmessage') {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID.value(),
    GOOGLE_CLIENT_SECRET.value(),
    redirectUri
  )
}

exports.exchangeGoogleCode = onCall({ cors: true, secrets: [GOOGLE_CLIENT_SECRET] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')

  const { code, redirect_uri } = request.data
  const authClient = createAuthClient(redirect_uri)

  try {
    const { tokens } = await authClient.getToken(code);
    
    await db.collection('users').doc(request.auth.uid).set({
      google: {
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token,
        scope: tokens.scope,
        expiryDate: tokens.expiry_date,
        lastUpdated: new Date()
      }
    }, { merge: true })

    return { success: true }
  } catch (error) {
    console.error('Error exchanging token:', error);
    throw new HttpsError('internal', 'Failed to exchange authorization code', error.message);
  }
});

exports.fetchGoogleCalendars = onCall({ cors: true, secrets: [GOOGLE_CLIENT_SECRET] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const userRef = db.collection('users').doc(request.auth.uid)
  const userData = (await userRef.get()).data()
  
  if (!userData?.google?.refreshToken) throw new HttpsError('failed-precondition', 'No refresh token')

  const authClient = createAuthClient()
  authClient.setCredentials({ refresh_token: userData.google.refreshToken })

  const apiClient = google.calendar({ version: 'v3', auth: authClient });

  try {
    const [calendarListResponse, colorsResponse] = await Promise.all([
      apiClient.calendarList.list({ minAccessRole: 'reader' }),
      apiClient.colors.get()
    ])
    
    const allCalendars = (calendarListResponse.data.items || []) // According to the Google Calendar API, the items property may be absent if the list is empty. This will throw a TypeError if a user somehow has no calendar entries.
      .map(cal => ({
        id: cal.id,
        summary: cal.summary,
        backgroundColor: cal.backgroundColor,
        foregroundColor: cal.foregroundColor
      }))

    await userRef.update({
      googleCalendars: allCalendars,
      googleGlobalColorDefinitions: colorsResponse.data.event // maps event's `colorId` to a global definition
    })

    return { calendars: allCalendars };
  } catch (error) {
    console.error('Error fetching calendars:', error);
    throw new HttpsError('internal', 'Failed to fetch calendars', error.message);
  }
});

exports.fetchGoogleEvents = onCall({ cors: true, secrets: [GOOGLE_CLIENT_SECRET] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')

  const { timeMin, timeMax, calendarIds } = request.data;

  if (!Array.isArray(calendarIds) || calendarIds.length === 0) throw new HttpsError('invalid-argument', 'calendarIds must be a non-empty array.')

  const userDoc = await db.collection('users').doc(request.auth.uid).get()
  if (!userDoc.exists) throw new HttpsError('not-found', 'User not found.')

  const userData = userDoc.data()
  if (!userData?.google?.refreshToken) throw new HttpsError('failed-precondition', 'Google Calendar not connected.')

  const authClient = createAuthClient()
  authClient.setCredentials({ refresh_token: userData.google.refreshToken })

  const calendar = google.calendar({ version: 'v3', auth: authClient })

  try {
    const eventPromises = calendarIds.map(async calendarId => {
      try {
        const response = await calendar.events.list({
          calendarId,
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: 'startTime',
        });
        // Include calendarId with each event so frontend can match to calendar colors
        return (response.data.items || []).map(event => ({
          ...event,
          calendarId
        }))
      } catch (err) {
        console.error(`Error fetching events for calendar ${calendarId}:`, err);
        return [] // Fail gracefully
      }
    })

    const results = await Promise.all(eventPromises)
    const allEvents = results.flat()

    return { events: allEvents }

  } catch (error) {
    console.error('Error fetching calendar events:', error)
    throw new HttpsError('internal', 'Failed to fetch events', error.message)
  }
})
