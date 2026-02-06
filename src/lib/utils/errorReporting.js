import { cloudFunction } from '$lib/utils/cloudFunctions.js'
import { dev } from '$app/environment'

let count = 0
const stack_trace_limit = 5

export function reportError ({ subject, content }) {
  console.error('reportError', subject, content) // important, otherwise we suffocate all error 500s
  if (count < stack_trace_limit && !dev) {
    cloudFunction('sendEmail', {
      subject, content, toWho: 'elton@explanations.io'
    })
    count += 1
  }
}