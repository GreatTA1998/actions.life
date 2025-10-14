const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineString } = require('firebase-functions/params');
const { onCall, HttpsError } = require("firebase-functions/https");
const functions = require('firebase-functions');
const { checkNotify } = require('./checkNotify');
const postmark = require("postmark");
require("firebase-functions/logger/compat");

// const { handleTemplate } = require('./handleTemplate');
// const { getFirestore, getDocs, collection, where, setDoc, doc } = require('firebase-admin/firestore');
// const db = getFirestore('schema-compliant');

const POSTMARK_API_KEY = defineString('POSTMARK_API_KEY');

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