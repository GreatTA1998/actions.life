import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register(new URL('./homeRecorder.test.loader.mjs', import.meta.url), pathToFileURL('./'))

const KEY = 'rrweb:home'
const CASE = process.env.HOMERECORDER_CASE
const unhandled = []
process.on('unhandledRejection', (reason) => {
  unhandled.push(String(reason?.message || reason))
})

function tick () {
  return new Promise((resolve) => setImmediate(resolve))
}

async function settle () {
  for (let i = 0; i < 12; i++) await tick()
  await new Promise((resolve) => setTimeout(resolve, 20))
  for (let i = 0; i < 8; i++) await tick()
}

function installTimers () {
  const intervals = []
  const origSet = globalThis.setInterval
  const origClear = globalThis.clearInterval
  globalThis.setInterval = (fn) => {
    intervals.push(fn)
    return intervals.length
  }
  globalThis.clearInterval = () => {}
  return {
    get count () { return intervals.length },
    async flushAll () {
      for (const fn of intervals) fn()
      await settle()
    },
    restore () {
      globalThis.setInterval = origSet
      globalThis.clearInterval = origClear
    }
  }
}

globalThis.localStorage = Object.create(null)
globalThis.document = {
  visibilityState: 'visible',
  addEventListener () {},
  removeEventListener () {}
}

const timers = installTimers()
const uploads = []
let releaseImport
globalThis.__rrwebTest = {
  storage: {},
  failImport: CASE === 'failed-import',
  waitForImport: CASE === 'before-import'
    ? new Promise((resolve) => { releaseImport = resolve })
    : null,
  uploadBytes (storageRef) {
    uploads.push({ path: storageRef.path })
    if (CASE === 'denied-upload') return Promise.reject(new Error('storage write denied'))
    return Promise.resolve({ ref: storageRef })
  },
  record ({ emit }) {
    emit({ type: 2, data: { href: 'https://example.test/' } })
    return () => {}
  }
}

const { startHomeRecorder } = await import('./homeRecorder.js')
const { authUser } = await import('$lib/store')
const stop = startHomeRecorder()

function report (payload) {
  process.stdout.write(JSON.stringify({ ...payload, unhandled }) + '\n')
}

if (CASE === 'before-import') {
  authUser.set({ uid: 'anon-1' })
  const localStorageSetBeforeImport = Boolean(globalThis.localStorage[KEY])
  const intervalBeforeImport = timers.count
  releaseImport()
  await settle()
  report({ localStorageSetBeforeImport, intervalBeforeImport, intervalAfterImport: timers.count })
} else if (CASE === 'failed-import') {
  authUser.set({ uid: 'anon-2' })
  await settle()
  report({
    localStorageSetAfterFail: Boolean(globalThis.localStorage[KEY]),
    intervalCount: timers.count
  })
} else if (CASE === 'denied-upload') {
  authUser.set({ uid: 'anon-3' })
  await settle()
  await timers.flushAll()
  await timers.flushAll()
  report({
    intervalStarted: timers.count >= 1,
    uploads: uploads.length,
    localStorageSet: Boolean(globalThis.localStorage[KEY])
  })
} else if (CASE === 'success') {
  authUser.set({ uid: 'anon-ok' })
  const localStorageSetBeforeFlush = Boolean(globalThis.localStorage[KEY])
  await settle()
  await timers.flushAll()
  report({
    localStorageSetBeforeFlush,
    localStorageSetAfterFlush: Boolean(globalThis.localStorage[KEY]),
    uploads: uploads.length
  })
} else {
  throw new Error(`unknown HOMERECORDER_CASE ${CASE}`)
}

stop()
timers.restore()
