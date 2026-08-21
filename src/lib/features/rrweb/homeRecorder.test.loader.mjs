import { pathToFileURL } from 'node:url'

const mock = (source) => `data:text/javascript,${encodeURIComponent(source)}`

const appEnvironment = mock(`
  export const browser = true
  export const dev = false
`)

const svelteStore = mock(`
  export function get (store) {
    let current
    store.subscribe((v) => { current = v })()
    return current
  }
`)

const libStore = mock(`
  let value = null
  const subs = new Set()
  export const authUser = {
    subscribe (fn) {
      subs.add(fn)
      fn(value)
      return () => subs.delete(fn)
    },
    set (next) {
      value = next
      for (const fn of subs) fn(value)
    }
  }
`)

const firebaseStorage = mock(`
  export function getStorage () { return globalThis.__rrwebTest.storage }
  export function ref (storage, path) { return { storage, path } }
  export function uploadBytes (storageRef, data) {
    return globalThis.__rrwebTest.uploadBytes(storageRef, data)
  }
`)

const rrweb = mock(`
  if (globalThis.__rrwebTest?.failImport) throw new Error('rrweb chunk failed to load')
  export function record (opts) { return globalThis.__rrwebTest.record(opts) }
`)

export async function resolve (specifier, context, nextResolve) {
  if (specifier === 'rrweb' && globalThis.__rrwebTest?.waitForImport) {
    await globalThis.__rrwebTest.waitForImport
  }
  if (specifier === '$app/environment') return { url: appEnvironment, shortCircuit: true }
  if (specifier === 'svelte/store') return { url: svelteStore, shortCircuit: true }
  if (specifier === '$lib/store') return { url: libStore, shortCircuit: true }
  if (specifier === 'firebase/storage') return { url: firebaseStorage, shortCircuit: true }
  if (specifier === 'rrweb') return { url: rrweb, shortCircuit: true }
  return nextResolve(specifier, context)
}
