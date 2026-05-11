import { reportError } from '$lib/utils/errors.js'

export function handleError ({ event, error }) {
  reportError({ 
    subject: 'handleError from hooks.server.js', 
    content: event.url.pathname + '\n' + error.stack 
  })
}

// enables iOS localhost / ngrok to work with Firebase auth
export async function handle ({ event, resolve }) {
  // Force ngrok URL in auth operations
  if (event.url.hostname.includes('ngrok')) {
    event.locals.authDomain = event.url.origin;
  }
  return resolve(event)
}