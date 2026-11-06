/**
 * Ask the service worker to put SSR/HTML routes into Cache Storage so offline
 * reloads of those paths can serve a shell without a network round-trip.
 * @param {string[]} urls
 */
export function warmShellUrls (urls) {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
  const unique = [...new Set(urls.filter(Boolean))]
  if (unique.length === 0) return

  const post = (sw) => {
    try {
      sw.postMessage({ type: 'WARM_URLS', urls: unique })
    } catch {
      // SW may not be ready yet
    }
  }

  if (navigator.serviceWorker.controller) {
    post(navigator.serviceWorker.controller)
    return
  }

  navigator.serviceWorker.ready
    .then((reg) => {
      if (reg.active) post(reg.active)
    })
    .catch(() => {})
}
