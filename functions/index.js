const admin = require('firebase-admin')
require('firebase-functions/logger/compat')

if (admin.apps.length === 0) { // global scope is sometimes preserved ("warm starts")
  admin.initializeApp()
}

// Register from separate modules so the OAuth path stays free of googleapis.
exports.exchangeForTokens = require('./exchangeForTokens.js').exchangeForTokens
exports.fetchGoogleCalendars = require('./googleCalendar.js').fetchGoogleCalendars
exports.fetchGoogleEvents = require('./googleCalendar.js').fetchGoogleEvents
exports.sendEmail = require('./postmark.js').sendEmail
