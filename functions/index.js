const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineString, defineSecret } = require('firebase-functions/params');
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const functions = require('firebase-functions');
const { checkNotify } = require('./checkNotify');
const postmark = require("postmark");
const { google } = require('googleapis');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// Initialize if not already done
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = getFirestore('schema-compliant');

require("firebase-functions/logger/compat");

// const { handleTemplate } = require('./handleTemplate');

const POSTMARK_API_KEY = defineString('POSTMARK_API_KEY');
const GOOGLE_CLIENT_ID = defineString('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = defineSecret('GOOGLE_CLIENT_SECRET');

exports.exchangeGoogleCode = onCall({ cors: true, secrets: [GOOGLE_CLIENT_SECRET] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { code, redirect_uri } = request.data;
  
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID.value(),
    GOOGLE_CLIENT_SECRET.value(),
    redirect_uri || 'postmessage'
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store the refresh token (and access token if you want)
    // Note: storing access_token is optional as it expires, but refresh_token is key.
    await db.collection('users').doc(request.auth.uid).set({
      google: {
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token, // Optional
        scope: tokens.scope,
        expiryDate: tokens.expiry_date,
        lastUpdated: new Date()
      }
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error exchanging token:', error);
    throw new HttpsError('internal', 'Failed to exchange authorization code', error.message);
  }
});

exports.fetchGoogleEvents = onCall({ cors: true, secrets: [GOOGLE_CLIENT_SECRET] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { timeMin, timeMax } = request.data;

  const userDoc = await db.collection('users').doc(request.auth.uid).get();
  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'User not found.');
  }
  const userData = userDoc.data();
  if (!userData.google || !userData.google.refreshToken) {
    throw new HttpsError('failed-precondition', 'Google Calendar not connected.');
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID.value(),
    GOOGLE_CLIENT_SECRET.value()
  );

  oauth2Client.setCredentials({
    refresh_token: userData.google.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return { events: response.data.items };
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw new HttpsError('internal', 'Failed to fetch events', error.message);
  }
});

exports.sendEmail = onCall(async (request) => {
  var client = new postmark.ServerClient(
    POSTMARK_API_KEY.value()
  )

  const { toWho, subject, content } = request.data
  console.log('functions sending email to:', toWho)
 
  const result = await client.sendEmail({
    "From": "elton@explanations.io",
    "To": toWho,
    "Subject": subject,
    "HtmlBody": content,
    "TextBody": content,
    "MessageStream": "outbound"
  })

  console.log('finished sending email')
  return { success: true, result }
})

// unused
exports.notifications = onSchedule(
  {
    schedule: '* * * * *', // crontab syntax every min
    region: 'asia-northeast1', // Tokyo region
  },
  async (event) => {
    await checkNotify(db);
  },
)