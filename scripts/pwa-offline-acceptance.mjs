/**
 * Acceptance harness for offline-capable PWA behavior.
 *
 * Verifies:
 * 1) Online first visit loads the home shell + Firebase anonymous demo data
 * 2) Service worker controls the page and caches the shell
 * 3) Offline reload serves the app (0 network for document) with usable UI
 * 4) Online restore still works
 *
 * Usage: node scripts/pwa-offline-acceptance.mjs
 * Expects: npm run build && npm run preview -- --host 127.0.0.1 --port 4173
 */
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'

const BASE = process.env.PWA_BASE_URL || 'http://127.0.0.1:4173'
const ARTIFACTS = '/opt/cursor/artifacts'
mkdirSync(ARTIFACTS, { recursive: true })

const results = []

function record (name, ok, detail = '') {
  results.push({ name, ok, detail })
  const mark = ok ? 'PASS' : 'FAIL'
  console.log(`[${mark}] ${name}${detail ? ` — ${detail}` : ''}`)
}

async function waitForDemoReady (page, timeout = 60000) {
  // Home demo shows LoadingLogo until treesByDate / initialDataReady
  await page.waitForFunction(() => {
    const logo = document.querySelector('img.pulse')
    const heading = document.querySelector('h1')
    return Boolean(heading) && !logo
  }, { timeout })
}

async function swInfo (page) {
  return page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { supported: false }
    const reg = await navigator.serviceWorker.getRegistration()
    const controlling = Boolean(navigator.serviceWorker.controller)
    const cachesKeys = await caches.keys()
    let shellCached = false
    for (const key of cachesKeys) {
      const cache = await caches.open(key)
      const match = await cache.match('/')
      if (match) shellCached = true
    }
    return {
      supported: true,
      controlling,
      scope: reg?.scope ?? null,
      active: Boolean(reg?.active),
      cachesKeys,
      shellCached
    }
  })
}

async function main () {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  // ---- Online fresh load ----
  const onlineStart = Date.now()
  const response = await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  record('online.fresh_navigation', response?.ok() === true, `status=${response?.status()}`)

  await waitForDemoReady(page)
  const onlineMs = Date.now() - onlineStart
  record('online.demo_data_ready', true, `${onlineMs}ms until loading overlay cleared`)

  const hasPlannerCopy = await page.locator('h1').textContent()
  record(
    'online.core_ui',
    Boolean(hasPlannerCopy?.includes('hierarchical planner')),
    hasPlannerCopy?.trim()?.slice(0, 80) || ''
  )

  // Give SW install/activate + Firestore persistence a moment to settle
  await page.waitForTimeout(2500)
  // Force a second navigation so the SW can claim + warm caches
  await page.reload({ waitUntil: 'domcontentloaded' })
  await waitForDemoReady(page)
  await page.waitForTimeout(1500)

  let info = await swInfo(page)
  record('online.sw_supported', info.supported === true)
  record('online.sw_active', info.active === true, JSON.stringify(info.cachesKeys))
  record('online.sw_controlling', info.controlling === true)
  record('online.shell_cached', info.shellCached === true)

  // Ensure Firestore persistence DB exists (best-effort name match)
  const idb = await page.evaluate(async () => {
    if (!indexedDB.databases) return { databases: null }
    const dbs = await indexedDB.databases()
    return {
      databases: dbs.map((d) => d.name),
      hasFirestore: dbs.some((d) => /firestore|firebase/i.test(d.name || ''))
    }
  })
  record('online.firestore_idb', idb.hasFirestore === true, JSON.stringify(idb.databases))

  await page.screenshot({ path: `${ARTIFACTS}/pwa_online_ready.png`, fullPage: false })

  // ---- Offline reload ----
  await context.setOffline(true)
  const offlineStart = Date.now()
  const offlineErrors = []
  page.on('pageerror', (err) => offlineErrors.push(String(err)))

  const offlineNav = await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch((e) => {
    offlineErrors.push(String(e))
    return null
  })
  record('offline.reload_navigation', offlineNav !== null, offlineNav ? `status=${offlineNav.status()}` : 'navigation failed')

  // Must not sit on the indefinite loading logo
  let offlineReady = false
  try {
    await waitForDemoReady(page, 15000)
    offlineReady = true
  } catch (e) {
    offlineErrors.push(String(e))
  }
  const offlineMs = Date.now() - offlineStart
  record('offline.app_usable', offlineReady, `${offlineMs}ms; errors=${offlineErrors.slice(0, 3).join(' | ')}`)

  const stillHasHeading = await page.locator('h1').count()
  record('offline.shell_visible', stillHasHeading > 0)

  const logoStuck = await page.locator('img.pulse').count()
  record('offline.no_indefinite_spinner', logoStuck === 0, `pulseLogos=${logoStuck}`)

  // Transfer size for the main document should be ~0 when served from SW cache
  const docTransfer = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    return nav
      ? { transferSize: nav.transferSize, encodedBodySize: nav.encodedBodySize }
      : null
  })
  record(
    'offline.cached_document',
    docTransfer != null && docTransfer.transferSize === 0,
    JSON.stringify(docTransfer)
  )

  await page.screenshot({ path: `${ARTIFACTS}/pwa_offline_reload.png`, fullPage: false })

  // ---- Connectivity restore ----
  await context.setOffline(false)
  const restoreStart = Date.now()
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 })
  await waitForDemoReady(page, 60000)
  const restoreMs = Date.now() - restoreStart
  record('online_restore.demo_ready', true, `${restoreMs}ms`)

  info = await swInfo(page)
  record('online_restore.sw_controlling', info.controlling === true)

  await page.screenshot({ path: `${ARTIFACTS}/pwa_online_restored.png`, fullPage: false })

  await browser.close()

  writeFileSync(`${ARTIFACTS}/pwa_acceptance_results.json`, JSON.stringify(results, null, 2))

  const failed = results.filter((r) => !r.ok)
  console.log('\n=== Summary ===')
  console.log(`Passed: ${results.length - failed.length}/${results.length}`)
  if (failed.length) {
    console.error('Failed checks:', failed)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
