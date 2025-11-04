import { sendEmail } from '$lib/utils/cloudFunctions.js'

let count = 0

// App lifecycle tracking for iOS PWA debugging
if (typeof window !== 'undefined') {
  let appStartTime = Date.now();
  let suspendCount = 0;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('App suspended');
      localStorage.setItem('suspendTime', Date.now());
    } else {
      const suspendTime = localStorage.getItem('suspendTime');
      const suspendDuration = suspendTime ? Date.now() - parseInt(suspendTime) : 0;
      suspendCount++;

      console.log(`App resumed after ${suspendDuration}ms`);
      console.log(`App lifetime: ${Date.now() - appStartTime}ms`);
      console.log(`Suspend count: ${suspendCount}`);

      if (Date.now() - appStartTime < 1000) {
        console.log('🔄 HARD RELOAD - Process was killed');
        appStartTime = Date.now();
        suspendCount = 0;
      } else {
        console.log('⚡ STATE PRESERVED - Process survived');
      }
    }
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      console.log('⚡ Page restored from bfcache (back/forward cache)');
    }
  });
}

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
  }
}

window.onunhandledrejection = (error) => {
  if (count === 0) {
    count += 1
    sendEmail({
      subject: 'window.onunhandledrejection triggered',
      content: `
        message: ${error.reason?.message} \n
        stack: ${error.reason?.stack}
      `,
      toWho: 'elton@explanations.io'
    })
  }
}