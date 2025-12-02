import { getFunctions, httpsCallable } from 'firebase/functions'

export function sendEmail ({ subject, content, toWho }) {
  const functions = getFunctions()
  const sendEmail = httpsCallable(functions, 'sendEmail')
  return new Promise(async resolve => {
    await sendEmail({ subject, content, toWho })
    resolve()
  })
}

export function exchangeGoogleCode({ code }) {
  const functions = getFunctions();
  const fn = httpsCallable(functions, 'exchangeGoogleCode');
  return fn({ code });
}