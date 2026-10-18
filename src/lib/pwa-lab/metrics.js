/**
 * Boot / cache / timing helpers for the PWA lab UI and Playwright harness.
 */

export function isStandaloneDisplay () {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari legacy
    /** @type {any} */ (navigator).standalone === true
  )
}

export function collectResourceStats () {
  const resources = performance.getEntriesByType('resource')
  let transfer = 0
  let decoded = 0
  let cachedish = 0
  for (const entry of resources) {
    const r = /** @type {PerformanceResourceTiming} */ (entry)
    transfer += r.transferSize || 0
    decoded += r.decodedBodySize || 0
    // transferSize === 0 with non-zero decoded body usually means disk/memory/SW cache
    if ((r.transferSize === 0 || r.transferSize === undefined) && (r.decodedBodySize || 0) > 0) {
      cachedish += 1
    }
  }
  return {
    resourceCount: resources.length,
    transferBytes: transfer,
    decodedBytes: decoded,
    likelyCacheHits: cachedish
  }
}

/**
 * @param {number[]} samples
 */
export function summarize (samples) {
  if (!samples.length) return { n: 0, min: 0, max: 0, p50: 0, p95: 0, mean: 0 }
  const sorted = [...samples].sort((a, b) => a - b)
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length
  return {
    n: sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p50: pct(50),
    p95: pct(95),
    mean: Math.round(mean)
  }
}

/**
 * @param {() => Promise<unknown>} fn
 * @param {number} times
 */
export async function bench (fn, times = 20) {
  const samples = []
  for (let i = 0; i < times; i++) {
    const t0 = performance.now()
    await fn(i)
    samples.push(Math.round(performance.now() - t0))
  }
  return summarize(samples)
}

export async function getServiceWorkerState () {
  if (!('serviceWorker' in navigator)) {
    return { supported: false, controller: false, active: null }
  }
  const reg = await navigator.serviceWorker.getRegistration()
  return {
    supported: true,
    controller: !!navigator.serviceWorker.controller,
    active: reg?.active?.state ?? null,
    waiting: reg?.waiting?.state ?? null,
    installing: reg?.installing?.state ?? null,
    scope: reg?.scope ?? null
  }
}

/**
 * Wait until a service worker controls this page (needed after first visit).
 * @param {number} timeoutMs
 */
export async function waitForController (timeoutMs = 15000) {
  if (navigator.serviceWorker.controller) return true
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), timeoutMs)
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => {
        clearTimeout(timer)
        resolve(true)
      },
      { once: true }
    )
  })
}
