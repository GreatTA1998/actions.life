// enables iOS localhost / ngrok to work with Firebase auth
export async function handle ({ event, resolve }) {
  // Force ngrok URL in auth operations
  if (event.url.hostname.includes('ngrok')) {
    event.locals.authDomain = event.url.origin;
  }
  // The consent button grants task access. Do not let another site frame it.
  if (event.url.pathname === '/oauth/authorize') {
    event.setHeaders({
      'Content-Security-Policy': "frame-ancestors 'none'",
      'X-Frame-Options': 'DENY'
    })
  }
  return resolve(event)
}
