const { defineString, defineSecret } = require('firebase-functions/params')
const { onCall } = require('firebase-functions/v2/https')
const { OAuth2Client } = require('google-auth-library')

const GOOGLE_CLIENT_ID = defineString('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = defineSecret('GOOGLE_CLIENT_SECRET')

/**
 * Latency-sensitive OAuth redirect callback. Kept in its own module (no
 * googleapis / postmark) and with minInstances so cold starts don't add
 * multi-second delays on every sign-in.
 *
 * google-auth-library is required at module load so warm instances finish
 * initialization before the first request (see Firebase minInstances tips).
 */
exports.exchangeForTokens = onCall({
  cors: true,
  secrets: [GOOGLE_CLIENT_SECRET],
  minInstances: 1,
  memory: '256MiB'
}, async (request) => {
  const { authorizationCode, redirect_uri } = request.data
  const authClient = new OAuth2Client(
    GOOGLE_CLIENT_ID.value(),
    GOOGLE_CLIENT_SECRET.value(),
    redirect_uri
  )
  const { tokens } = await authClient.getToken(authorizationCode)
  const ticket = await authClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: GOOGLE_CLIENT_ID.value() // prevents against Confused Deputy attacks
  })
  const { sub, email } = ticket.getPayload()
  return { tokens, email, id: sub }
})
