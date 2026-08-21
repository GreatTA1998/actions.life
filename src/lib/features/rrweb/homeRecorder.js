import { browser, dev } from '$app/environment'
import { get } from 'svelte/store'
import { authUser } from '$lib/store'
import { getStorage, ref, uploadBytes } from 'firebase/storage'
import { createChunkedFlusher } from './chunkedFlusher.js'

const KEY = 'rrweb:home'

export function startHomeRecorder () {
  if (!browser || dev) return () => {}
  let stop = () => {}
  let started = false
  const unsub = authUser.subscribe((u) => {
    if (u?.email) { stop(); return }
    if (started || localStorage[KEY] || !u?.uid) return
    started = true
    localStorage[KEY] = '1'
    const uid = u.uid
    let cancelled = false
    stop = () => { cancelled = true }
    import('rrweb').then(({ record }) => {
      if (cancelled) return
      const flusher = createChunkedFlusher({
        upload: (path, json) => uploadBytes(ref(getStorage(), path), new Blob([json])),
        pathForChunk: (i) => `rrweb/${uid}/${String(i).padStart(6, '0')}.json`
      })
      const rec = record({ emit: (e) => flusher.push(e), maskAllInputs: false })
      const timer = setInterval(() => { flusher.flush() }, 4000)
      const onHide = () => document.visibilityState === 'hidden' && flusher.flush()
      document.addEventListener('visibilitychange', onHide)
      stop = () => {
        rec()
        clearInterval(timer)
        document.removeEventListener('visibilitychange', onHide)
        flusher.flush()
      }
      if (get(authUser)?.email) stop()
    })
  })
  return () => { unsub(); stop() }
}
