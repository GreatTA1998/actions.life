import { sendEmail } from '$lib/utils/cloudFunctions.js'

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

window.onerror = (msg, src, line, col, error) => {
  if (count === 0) {
    count += 1
    sendEmail({
      subject: 'window.onerror triggered',
      content: `
        msg: ${msg} \n
        src: ${src} \n
        line: ${line} \n
        col: ${col} \n
        error: ${error?.stack}
      `,
      toWho: 'elton@explanations.io'
    })
    return true // don't crash app
  }
}
window.onunhandledrejection = (e) => {
  if (count === 0) {
    count += 1
    sendEmail({
      subject: 'window.onunhandledrejection triggered',
      content: `
        message: ${e.reason?.message} \n
        stack: ${e.reason?.stack}
      `,
      toWho: 'elton@explanations.io'
    })
    e.preventDefault() // don't crash app
  }
}