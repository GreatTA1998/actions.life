import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import { getApp } from 'firebase/app'

const functions = getFunctions(getApp())
connectFunctionsEmulator(functions, "127.0.0.1", 5001)

export function sendEmail ({ subject, content, toWho }) {
  const functions = getFunctions()
  const sendEmail = httpsCallable(functions, 'sendEmail')
  return new Promise(async resolve => {
    await sendEmail({ subject, content, toWho })
    resolve()
  })
}

// TO-DO: abstract all these into 1 function
export function exchangeGoogleCode({ code }) {
  const functions = getFunctions()
  const fn = httpsCallable(functions, 'exchangeGoogleCode')
  return fn({ code })
}

export function fetchGoogleCalendars (params = {}) {
  const functions = getFunctions()
  const fn = httpsCallable(functions, 'fetchGoogleCalendars')
  return fn(params)
}

export function fetchGoogleEvents({ timeMin, timeMax, calendarIds, refreshToken }) {
  const functions = getFunctions()
  const fn = httpsCallable(functions, 'fetchGoogleEvents')
  return fn({ timeMin, timeMax, calendarIds, refreshToken })
}