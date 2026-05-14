import { auth } from '$lib/db/init.js'
import { firebaseAuth } from '$lib/store'
import { reportError } from '$lib/utils/errors.js'

firebaseAuth.set(auth)

export function handleError ({ event, error }) {
  console.error(event, error)
  reportError({ 
    subject: 'handleError from hooks.client.js', 
    content: event.url.pathname + '\n' + error.stack
  })
}

window.onerror = (msg, src, line, col, error) => {
  reportError({
    subject: 'window.onerror',
    content: `
      pathname: ${window.location.pathname} \n
      msg: ${msg} \n
      src: ${src} \n
      line: ${line} \n
      col: ${col} \n
      error: ${error?.stack}
    `
  })
}

window.onunhandledrejection = (error) => {
  reportError({
    subject: 'window.onunhandledrejection',
    content: `
      pathname: ${window.location.pathname} \n
      message: ${error.reason?.message} \n
      stack: ${error.reason?.stack}
    `
  })
}