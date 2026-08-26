#!/usr/bin/env node
/**
 * Simulate an iPhone home-screen PWA open in a loop until:
 * 1) service worker controls the page
 * 2) subsequent cold opens serve shell from cache (near-zero transfer)
 * 3) local-first offline mutate + reload preserves data
 * 4) local-first tree updates beat Firebase-style IDB updates
 *
 * Usage:
 *   node scripts/pwa-iphone-loop.mjs [baseUrl]
 */

import { chromium, devices } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = process.argv[2] || process.env.PWA_LAB_URL || 'http://127.0.0.1:4173'
const LAB = `${BASE.replace(/\/$/, '')}/pwa-lab`
const LOOPS = Number(process.env.PWA_LOOPS || 8)
const ARTIFACT_DIR = resolve(__dirname, '../.pwa-lab-results')

const iphone = devices['iPhone 14']

function log (...args) {
  console.log('[pwa-loop]', ...args)
}

async function waitReady (page, timeout = 30000) {
  await page.waitForSelector('[data-testid="pwa-lab"]', { timeout })
  await page.waitForFunction(() => window.__PWA_LAB__?.getState?.()?.ready === true, null, {
    timeout
  })
}

async function getState (page) {
  return page.evaluate(() => window.__PWA_LAB__.getState())
}

async function emulateStandalone (context, page) {
  const session = await context.newCDPSession(page)
  await session.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'display-mode', value: 'standalone' }]
  })
  return session
}

async function main () {
  mkdirSync(ARTIFACT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...iphone,
    serviceWorkers: 'allow',
    // iOS home-screen PWAs are HTTPS-only; localhost is a secure context
    ignoreHTTPSErrors: true
  })

  const page = await context.newPage()
  await emulateStandalone(context, page)

  const report = {
    base: BASE,
    lab: LAB,
    startedAt: new Date().toISOString(),
    loops: [],
    benches: null,
    offlineCorrectness: null,
    pass: false,
    failures: []
  }

  log('Opening', LAB, 'as iPhone 14 standalone')
  await page.goto(LAB, { waitUntil: 'networkidle' })
  await waitReady(page)

  // First visit installs SW; may need one reload to claim clients
  let state = await getState(page)
  if (!state.swState.controller) {
    log('No controller yet — reloading to claim clients')
    await page.reload({ waitUntil: 'networkidle' })
    await waitReady(page)
    state = await getState(page)
  }

  if (!state.swState.controller) {
    report.failures.push('Service worker never controlled the page')
  } else {
    log('SW controlling page:', state.swState.active)
  }

  if (!state.standalone) {
    // CDP emulation should make matchMedia('standalone') true
    report.failures.push('display-mode standalone not detected (CDP emulation failed)')
  } else {
    log('Standalone display-mode OK')
  }

  // Offline mutate + persist correctness
  await page.evaluate(async () => {
    await window.__PWA_LAB__.mutateOfflineOnce()
  })
  const afterMutate = await getState(page)
  const offlineName = afterMutate.lastLocalName
  if (!offlineName.startsWith('offline-')) {
    report.failures.push(`Offline mutate did not update task name: ${offlineName}`)
  }

  await page.evaluate(async () => {
    await window.__PWA_LAB__.reloadFromDisk()
  })
  const afterReloadDisk = await getState(page)
  if (afterReloadDisk.lastLocalName !== offlineName) {
    report.failures.push(
      `IDB reload lost offline write: expected ${offlineName}, got ${afterReloadDisk.lastLocalName}`
    )
  } else {
    log('Offline correctness OK:', offlineName)
    report.offlineCorrectness = { name: offlineName, ok: true }
  }

  // Benchmarks
  await page.evaluate(async () => {
    await window.__PWA_LAB__.runFirebaseBench()
    await window.__PWA_LAB__.runLocalBench()
  })
  const afterBench = await getState(page)
  report.benches = {
    firebase: afterBench.firebaseStats,
    local: afterBench.localStats
  }
  log('Firebase-style p50', afterBench.firebaseStats?.p50, 'ms')
  log('Local-first p50', afterBench.localStats?.p50, 'ms')

  if (!afterBench.localStats || !afterBench.firebaseStats) {
    report.failures.push('Benchmarks did not complete')
  } else if (!(afterBench.localStats.p50 < afterBench.firebaseStats.p50)) {
    report.failures.push(
      `Expected local-first p50 (${afterBench.localStats.p50}) < firebase-style p50 (${afterBench.firebaseStats.p50})`
    )
  }

  // Cold-open loop with network offline after shell is cached
  await context.setOffline(true)
  log(`Starting ${LOOPS} offline cold-open loops`)

  for (let i = 1; i <= LOOPS; i++) {
    const t0 = Date.now()
    await page.reload({ waitUntil: 'domcontentloaded' })
    try {
      await waitReady(page, 20000)
    } catch (err) {
      report.failures.push(`Loop ${i}: lab failed to become ready offline — ${err.message}`)
      break
    }
    await page.evaluate(() => window.__PWA_LAB__.refreshResourceStats())
    const s = await getState(page)
    const elapsed = Date.now() - t0
    const entry = {
      i,
      elapsedMs: elapsed,
      transferBytes: s.resources.transferBytes,
      cacheHits: s.resources.likelyCacheHits,
      controller: s.swState.controller,
      localCount: s.localCount,
      lastLocalName: s.lastLocalName
    }
    report.loops.push(entry)
    await page.evaluate((line) => window.__PWA_LAB__.appendLoopLog(line), JSON.stringify(entry))
    log(`loop ${i}: ${elapsed}ms transfer=${entry.transferBytes}B controller=${entry.controller}`)

    if (!entry.controller) {
      report.failures.push(`Loop ${i}: lost service worker controller`)
    }
    // After first cached open, transfer should stay low (allow tiny beacon noise)
    if (i >= 2 && entry.transferBytes > 150_000) {
      report.failures.push(
        `Loop ${i}: transfer ${entry.transferBytes}B too high — shell not cached`
      )
    }
    if (entry.localCount < 40) {
      report.failures.push(`Loop ${i}: local-first data missing (count=${entry.localCount})`)
    }
  }

  await context.setOffline(false)

  // Require majority of loops to be fast + cached
  const cachedLoops = report.loops.filter((l) => l.i >= 2 && l.transferBytes <= 150_000)
  if (cachedLoops.length < Math.max(1, LOOPS - 2)) {
    report.failures.push(
      `Only ${cachedLoops.length}/${Math.max(0, LOOPS - 1)} loops looked cache-served`
    )
  }

  report.pass = report.failures.length === 0
  report.finishedAt = new Date().toISOString()

  const outPath = resolve(ARTIFACT_DIR, 'iphone-loop-report.json')
  writeFileSync(outPath, JSON.stringify(report, null, 2))
  log('Wrote', outPath)
  log(report.pass ? 'PASS' : 'FAIL', report.failures)

  await browser.close()
  process.exit(report.pass ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
