import { browser, dev } from '$app/environment'
import { get } from 'svelte/store'
import { authUser } from '$lib/store'
import { getStorage, ref, uploadBytes } from 'firebase/storage'

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
    const events = []
    let cancelled = false
    stop = () => { cancelled = true }
    import('rrweb').then(({ record }) => {
      if (cancelled) return
      const rec = record({ emit: (e) => events.push(e), maskAllInputs: false })
      const flush = () => events.length && uploadBytes(
        ref(getStorage(), `rrweb/${uid}.json`),
        new Blob([JSON.stringify(events)])
      )
      const timer = setInterval(flush, 4000)
      const onHide = () => document.visibilityState === 'hidden' && flush()
      document.addEventListener('visibilitychange', onHide)
      stop = () => {
        rec()
        clearInterval(timer)
        document.removeEventListener('visibilitychange', onHide)
        flush()
      }
      if (get(authUser)?.email) stop()
    })
  })
  return () => { unsub(); stop() }
}
