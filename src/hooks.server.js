import { reportError } from '$lib/utils/errorReporting.js'

export function handleError ({ event, error }) {
  reportError({ 
    subject: 'Svelte handleError triggered', 
    content: event.url.pathname + '\n' + error.stack 
  })
}

// enables iOS localhost / ngrok to work with Firebase auth
export async function handle ({ event, resolve }) {
  // Force ngrok URL in auth operations
  if (event.url.hostname.includes('ngrok')) {
    event.locals.authDomain = event.url.origin;
  }
  return resolve(event);
}