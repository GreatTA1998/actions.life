/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker'

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (globalThis.self))

/** Cache name is versioned so activate can drop stale shells after deploy. */
const CACHE = `actions-shell-${version}`

/**
 * Precache only the app shell (hashed build assets + small static icons).
 * Skip large / rarely needed static media so install stays fast on iOS.
 */
const PRECACHE_SKIP = /\.(mp3|wav|ogg|mp4|webm)$/i
const ASSETS = [...build, ...files].filter((path) => !PRECACHE_SKIP.test(path))

/** Do not intercept third-party / realtime traffic. */
function shouldBypass (url) {
  if (url.origin !== sw.location.origin) return true
  // Firebase / Google APIs sometimes share origin via proxies; keep path guards too
  if (url.pathname.startsWith('/__/')) return true
  return false
}

sw.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      await cache.addAll(ASSETS)
      // Critical for iOS home-screen PWAs that almost never close "tabs"
      await sw.skipWaiting()
    })()
  )
})

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key !== CACHE) await caches.delete(key)
      }
      await sw.clients.claim()
    })()
  )
})

sw.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') sw.skipWaiting()
})

sw.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (shouldBypass(url)) return

  event.respondWith(handleGet(request, url))
})

/**
 * @param {Request} request
 * @param {URL} url
 */
async function handleGet (request, url) {
  const cache = await caches.open(CACHE)

  // Hashed Vite/SvelteKit assets + precached static files: cache-first (instant reopen)
  if (ASSETS.includes(url.pathname)) {
    const cached = await cache.match(url.pathname)
    if (cached) return cached
  }

  // Navigations (home-screen cold open): network-first with shell fallback
  if (request.mode === 'navigate') {
    try {
      const response = await fetch(request)
      if (response.ok) {
        await cache.put(request, response.clone())
      }
      return response
    } catch {
      const cached =
        (await cache.match(request)) ||
        (await cache.match('/pwa-lab')) ||
        (await cache.match('/'))
      if (cached) return cached
      return new Response('Offline — open the app once online to refresh the shell.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }
  }

  // Same-origin runtime GETs: stale-while-revalidate
  const cached = await cache.match(request)
  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response.ok && !response.headers.get('cache-control')?.includes('no-store')) {
        await cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => undefined)

  if (cached) {
    // Background refresh; ignore failures
    networkPromise.catch(() => {})
    return cached
  }

  const network = await networkPromise
  if (network) return network
  throw new Error(`No cache and network failed for ${url.pathname}`)
}
