//// we don't expect load function errors because we have none
//// https://svelte.dev/tutorial/kit/handleerror
// export function handleError ({ event, error }) {

// }

// enables iOS localhost / ngrok to work with Firebase auth
export async function handle ({ event, resolve }) {
  // Force ngrok URL in auth operations
  if (event.url.hostname.includes('ngrok')) {
    event.locals.authDomain = event.url.origin;
  }
  return resolve(event)
}