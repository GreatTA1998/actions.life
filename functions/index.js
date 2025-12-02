const admin = require('firebase-admin')
require('firebase-functions/logger/compat')

if (admin.apps.length === 0) { // global scope is sometimes preserved ("warm starts")
  admin.initializeApp()
}

Object.assign(exports, 
  require('./googleCalendar.js'),
  require('./postmark.js')
)