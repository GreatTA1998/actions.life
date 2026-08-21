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
    const uid = u.uid
    let cancelled = false
    stop = () => { cancelled = true }
    import('rrweb').then(({ record }) => {
      if (cancelled) {
        started = false
        return
      }
      const flusher = createChunkedFlusher({
        upload: async (path, json) => {
          await uploadBytes(ref(getStorage(), path), new Blob([json]))
          try { localStorage[KEY] = '1' } catch {}
        },
        pathForChunk: (i) => `rrweb/${uid}/${String(i).padStart(6, '0')}.json`
      })
      const rec = record({ emit: (e) => flusher.push(e), maskAllInputs: false })
      const tick = () => { flusher.flush().catch(() => {}) }
      const timer = setInterval(tick, 4000)
      const onHide = () => { if (document.visibilityState === 'hidden') tick() }
      document.addEventListener('visibilitychange', onHide)
      stop = () => {
        rec()
        clearInterval(timer)
        document.removeEventListener('visibilitychange', onHide)
        tick()
      }
      if (get(authUser)?.email) stop()
    }).catch(() => { started = false })
  })
  return () => { unsub(); stop() }
}
