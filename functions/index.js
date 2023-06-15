/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require("firebase-functions") 
const { onCall } = require("firebase-functions/v2/https");
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid')
// const { PLAID_CLIENT_ID, PLAID_SECRET } = require('./.secrets.js')

// SETUP CODE SHARED BY FUNCTIONS
const PLAID_CLIENT_ID = '60a82f4b2dd19f0010a1abd3'
const PLAID_SECRET = 'b86a3e600550c25c233aee0c30dce9'

console.log('PLAID_CLIENT_ID =', PLAID_CLIENT_ID)
console.log('PLAID_SECRET =', PLAID_SECRET)

const PLAID_PRODUCTS = ['auth'] // I think 'transactions' work as well, but not 'balance'
const PLAID_COUNTRY_CODES = ['US','CA']

const configuration = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
})

const client = new PlaidApi(configuration);
// END OF SETUP CODE

exports.createLinkToken = functions.https.onCall(async (request, response) => {
  console.log('calling createLinkToken()')
  const configs = {
    user: {
      client_user_id: 'user-id',
    },
    client_name: 'Organize-life',
    products: PLAID_PRODUCTS,
    country_codes: PLAID_COUNTRY_CODES,
    language: 'en',
  };
  const createTokenResponse = await client.linkTokenCreate(configs)
  return createTokenResponse.data 
})

exports.exchangePublicTokenForAccessToken = functions.https.onCall(async (data, context) => {
  const { publicToken } = data
  console.log('publicToken =', publicToken)
  const tokenResponse = await client.itemPublicTokenExchange({
    public_token: publicToken
  })

  const ACCESS_TOKEN = tokenResponse.data.access_token;
  const ITEM_ID = tokenResponse.data.item_id;
  return {
    access_token: ACCESS_TOKEN,
    item_id: ITEM_ID,
    error: null
  }
})

exports.getBalance = functions.https.onCall(async (data, context) => {
  const ACCESS_TOKEN = data.accessToken
  const balanceResponse = await client.accountsBalanceGet({
    access_token: ACCESS_TOKEN,
  })
  return balanceResponse.data
})


// TO-DO
//  - Figure out how to what part of the code is responsible for the Plaid Link UI 
//  - Trade the link token for a public token 
//  - Trade the public token for an access token which you store on Firebase or hard-code in your codebase
//  - Fix the hover and indentation issue for creating new sub-tasks
//  - Implement hour, day, week, month modes properly
//  - Fix infinite bugs


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

