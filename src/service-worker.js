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

/** SSR/HTML routes that must be warm for home-screen / offline cold opens. */
const SHELL_ROUTES = ['/']

/** Do not intercept third-party / Firebase realtime traffic. */
function shouldBypass (url) {
  if (url.origin !== sw.location.origin) return true
  if (url.pathname.startsWith('/__/')) return true
  return false
}

/**
 * @param {Cache} cache
 * @param {string[]} urls
 */
async function warmUrls (cache, urls) {
  await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url, { credentials: 'same-origin' })
        if (response.ok) {
          await cache.put(url, response.clone())
          // Also key by pathname for navigate fallback matching
          const path = new URL(url, sw.location.origin).pathname
          await cache.put(path, response.clone())
        }
      } catch {
        // Install can race offline; ignore — client will re-warm later.
      }
    })
  )
}

sw.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      await cache.addAll(ASSETS)
      await warmUrls(cache, SHELL_ROUTES)
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
      const cache = await caches.open(CACHE)
      await warmUrls(cache, SHELL_ROUTES)
      await sw.clients.claim()
    })()
  )
})

sw.addEventListener('message', (event) => {
  const data = event.data
  if (!data || typeof data !== 'object') return

  if (data.type === 'SKIP_WAITING') {
    sw.skipWaiting()
    return
  }

  if (data.type === 'WARM_URLS' && Array.isArray(data.urls)) {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE)
        await warmUrls(cache, data.urls)
      })()
    )
  }
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
    const cached =
      (await cache.match(url.pathname)) ||
      (await cache.match(request))
    if (cached) return cached
  }

  // Navigations (home-screen cold open / offline reload): network-first with shell fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    try {
      const response = await fetch(request)
      if (response.ok) {
        await cache.put(url.pathname, response.clone())
        await cache.put(request, response.clone())
      }
      return response
    } catch {
      const cached =
        (await cache.match(request)) ||
        (await cache.match(url.pathname)) ||
        (await cache.match('/'))
      if (cached) return cached
      return new Response('Offline — open the app once online to cache the shell.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }
  }

  // Same-origin runtime GETs (SvelteKit data, fonts, etc.): stale-while-revalidate
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
    networkPromise.catch(() => {})
    return cached
  }

  const network = await networkPromise
  if (network) return network
  throw new Error(`No cache and network failed for ${url.pathname}`)
}
