import { sendEmail } from '$lib/utils/cloudFunctions.js'
// import { redirect } from '@sveltejs/kit'

let count = 0

export function handleError ({ event, error }) {
  if (count === 0) {
    count += 1
    sendEmail({
      subject: 'Svelte handleError triggered',
      content: error.stack,
      toWho: 'elton@explanations.io'
    }) 
  }
}

// enables iOS localhost / ngrok to work with Firebase auth
export async function handle({ event, resolve }) {
  // Force ngrok URL in auth operations
  if (event.url.hostname.includes('ngrok')) {
    event.locals.authDomain = event.url.origin;
  }
  return resolve(event);
}