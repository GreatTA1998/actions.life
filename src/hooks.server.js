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