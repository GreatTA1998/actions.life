import { reportError } from '$lib/utils/errorReporting.js'

export function handleError ({ event, error }) {
  reportError({ 
    subject: 'Svelte handleError triggered', 
    content: event.url.pathname + '\n' + error.stack 
  })
}

window.onerror = (msg, src, line, col, error) => {
  reportError({
    subject: 'window.onerror triggered',
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
    subject: 'window.onunhandledrejection triggered',
    content: `
      pathname: ${window.location.pathname} \n
      message: ${error.reason?.message} \n
      stack: ${error.reason?.stack}
    `
  })
}