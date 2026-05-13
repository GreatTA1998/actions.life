const postmark = require('postmark')
const { defineString } = require('firebase-functions/params')
const { onCall } = require('firebase-functions/v2/https')

const POSTMARK_API_KEY = defineString('POSTMARK_API_KEY')

exports.sendEmail = onCall(async (request) => {
  var client = new postmark.ServerClient(
    POSTMARK_API_KEY.value()
  )

  const { toWho, subject, content } = request.data
 
  const result = await client.sendEmail({
    "From": "elton@explanations.io",
    "To": toWho,
    "Subject": subject,
    "HtmlBody": content,
    "TextBody": content,
    "MessageStream": "outbound"
  })

  return { success: true, result }
})