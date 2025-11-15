import { sendEmail } from '$lib/utils/cloudFunctions.js'
import { dev } from '$app/environment'

let count = 0
const stack_trace_limit = 5

export function reportError ({ subject, content }) {
  if (count < stack_trace_limit && !dev) {
    sendEmail({
      subject, content, toWho: 'elton@explanations.io'
    })
    count += 1
  }
}