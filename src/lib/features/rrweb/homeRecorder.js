import { browser, dev } from '$app/environment'
import { get } from 'svelte/store'
import { authChecked, authUser } from '$lib/store'
import { getStorage, ref, uploadBytes } from 'firebase/storage'
import { randomID } from '$lib/utils/core.js'

const KEY = 'rrweb:home'

export function startHomeRecorder () {
  if (!browser || dev) return () => {}
  let stop = () => {}
  const unsub = authChecked.subscribe((checked) => {
    if (!checked || localStorage[KEY] || get(authUser)?.email) return
    localStorage[KEY] = '1'
    let cancelled = false
    const id = randomID()
    const events = []
    const unsubAuth = authUser.subscribe((u) => { if (u?.email) stop() })
    stop = () => { cancelled = true; unsubAuth() }
    import('rrweb').then(({ record }) => {
      if (cancelled) return
      const rec = record({ emit: (e) => events.push(e), maskAllInputs: false })
      const flush = () => events.length && uploadBytes(
        ref(getStorage(), `rrweb/${id}.json`),
        new Blob([JSON.stringify(events)])
      )
      const timer = setInterval(flush, 4000)
      const onHide = () => document.visibilityState === 'hidden' && flush()
      document.addEventListener('visibilitychange', onHide)
      stop = () => {
        rec()
        clearInterval(timer)
        unsubAuth()
        document.removeEventListener('visibilitychange', onHide)
        flush()
      }
      if (get(authUser)?.email) stop()
    })
  })
  return () => { unsub(); stop() }
}
