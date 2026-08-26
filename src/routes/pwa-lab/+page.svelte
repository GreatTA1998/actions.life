<script>
  import { onMount } from 'svelte'
  import {
    seedFirebaseStyleTree,
    firebaseStyleUpdateTree,
    listFirebaseStyle,
    clearFirebaseStyle
  } from '$lib/pwa-lab/firebaseStyleStore.js'
  import {
    seedLocalFirstTree,
    localFirstUpdateTree,
    listLocalFirst,
    loadLocalFirstFromDisk,
    clearLocalFirst,
    setLocalFirstOnline,
    getSyncQueueLength
  } from '$lib/pwa-lab/localFirstStore.js'
  import {
    isStandaloneDisplay,
    collectResourceStats,
    bench,
    getServiceWorkerState,
    waitForController
  } from '$lib/pwa-lab/metrics.js'

  const TREE_SIZE = 40
  const BENCH_N = 25

  let bootMs = $state(0)
  let standalone = $state(false)
  let swState = $state(/** @type {any} */ ({}))
  let resources = $state(/** @type {any} */ ({}))
  let status = $state('Booting…')
  let firebaseStats = $state(/** @type {any} */ (null))
  let localStats = $state(/** @type {any} */ (null))
  let firebaseCount = $state(0)
  let localCount = $state(0)
  let syncQueued = $state(0)
  let offlineSim = $state(false)
  let lastLocalName = $state('')
  let ready = $state(false)
  let loopLog = $state(/** @type {string[]} */ ([]))

  onMount(async () => {
    const t0 = performance.now()
    standalone = isStandaloneDisplay()
    status = 'Waiting for service worker…'
    const controlled = await waitForController(20000)
    swState = await getServiceWorkerState()
    resources = collectResourceStats()
    bootMs = Math.round(performance.now() - t0)

    status = controlled || swState.controller
      ? 'Service worker controlling page'
      : 'No controller yet — reload once after install'

    // Ensure this HTML shell is in Cache Storage (first nav often races SW claim)
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'WARM_URLS',
        urls: [location.pathname, '/', '/pwa-lab']
      })
    }

    // Preserve IDB across home-screen reopens (do not wipe on every mount)
    const existing = await loadLocalFirstFromDisk()
    if (existing > 0) {
      localCount = existing
      lastLocalName = listLocalFirst().find((t) => t.id === 'task-0')?.name ?? ''
      const fb = await listFirebaseStyle()
      if (fb.length === 0) firebaseCount = await seedFirebaseStyleTree(TREE_SIZE)
      else firebaseCount = fb.length
    } else {
      await seedBoth()
    }

    syncQueued = getSyncQueueLength()
    ready = true
    status = 'Ready — run benches or reload offline'
    exposeHarness()
  })

  async function seedBoth () {
    await clearFirebaseStyle()
    await clearLocalFirst()
    firebaseCount = await seedFirebaseStyleTree(TREE_SIZE)
    localCount = await seedLocalFirstTree(TREE_SIZE)
    syncQueued = getSyncQueueLength()
  }

  async function runFirebaseBench () {
    status = 'Benchmarking Firebase-style IDB tree updates…'
    firebaseStats = await bench(
      (i) => firebaseStyleUpdateTree('task-0', `Fb ${i}`, `2026-08-${String((i % 28) + 1).padStart(2, '0')}`),
      BENCH_N
    )
    firebaseCount = (await listFirebaseStyle()).length
    status = `Firebase-style p50=${firebaseStats.p50}ms`
  }

  async function runLocalBench () {
    status = 'Benchmarking local-first tree updates…'
    localStats = await bench(
      (i) => localFirstUpdateTree('task-0', `Lf ${i}`, `2026-08-${String((i % 28) + 1).padStart(2, '0')}`),
      BENCH_N
    )
    localCount = listLocalFirst().length
    lastLocalName = listLocalFirst().find((t) => t.id === 'task-0')?.name ?? ''
    syncQueued = getSyncQueueLength()
    status = `Local-first p50=${localStats.p50}ms (queue=${syncQueued})`
  }

  function toggleOffline () {
    offlineSim = !offlineSim
    setLocalFirstOnline(!offlineSim)
    syncQueued = getSyncQueueLength()
    status = offlineSim ? 'Local-first sync paused (offline)' : 'Local-first sync online'
  }

  async function mutateOfflineOnce () {
    offlineSim = true
    setLocalFirstOnline(false)
    const name = `offline-${Date.now()}`
    await localFirstUpdateTree('task-0', name)
    lastLocalName = listLocalFirst().find((t) => t.id === 'task-0')?.name ?? ''
    syncQueued = getSyncQueueLength()
    status = `Offline mutate ok → ${lastLocalName}`
  }

  async function reloadFromDisk () {
    const n = await loadLocalFirstFromDisk()
    localCount = n
    lastLocalName = listLocalFirst().find((t) => t.id === 'task-0')?.name ?? ''
    status = `Reloaded ${n} local-first tasks from IDB`
  }

  function refreshResourceStats () {
    resources = collectResourceStats()
    status = 'Resource stats refreshed'
  }

  function exposeHarness () {
    // Playwright / console harness for cold-start loops
    /** @type {any} */ (window).__PWA_LAB__ = {
      getState: () => ({
        bootMs,
        standalone,
        swState,
        resources,
        firebaseStats,
        localStats,
        firebaseCount,
        localCount,
        syncQueued,
        lastLocalName,
        offlineSim,
        ready,
        displayMode: standalone ? 'standalone' : 'browser'
      }),
      runFirebaseBench,
      runLocalBench,
      mutateOfflineOnce,
      reloadFromDisk,
      seedBoth,
      refreshResourceStats,
      waitForController,
      getServiceWorkerState,
      collectResourceStats,
      appendLoopLog: (line) => {
        loopLog = [...loopLog.slice(-40), line]
      }
    }
  }
</script>

<svelte:head>
  <title>PWA Lab · actions.life</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="lab" data-testid="pwa-lab">
  <header class="hero">
    <p class="brand">actions.life</p>
    <h1>PWA Lab</h1>
    <p class="lede">
      Prove app-shell caching and offline task-tree correctness — without rewriting the whole product.
    </p>
  </header>

  <section class="panel" aria-label="Environment">
    <h2>Environment</h2>
    <dl class="grid">
      <div><dt>Display</dt><dd data-testid="display-mode">{standalone ? 'standalone (home screen)' : 'browser'}</dd></div>
      <div><dt>Boot probe</dt><dd data-testid="boot-ms">{bootMs} ms</dd></div>
      <div><dt>SW controller</dt><dd data-testid="sw-controller">{swState.controller ? 'yes' : 'no'}</dd></div>
      <div><dt>SW active</dt><dd data-testid="sw-active">{swState.active ?? '—'}</dd></div>
      <div><dt>Transfer</dt><dd data-testid="transfer-bytes">{resources.transferBytes ?? 0} B</dd></div>
      <div><dt>Cache-like hits</dt><dd data-testid="cache-hits">{resources.likelyCacheHits ?? 0}</dd></div>
    </dl>
    <p class="status" data-testid="status">{status}</p>
    <div class="actions">
      <button type="button" onclick={refreshResourceStats}>Refresh resource stats</button>
      <button type="button" onclick={() => location.reload()}>Reload (simulates reopen)</button>
    </div>
  </section>

  <section class="panel" aria-label="Data backends">
    <h2>Task tree backends</h2>
    <p class="lede tight">
      Same tree size ({TREE_SIZE} children). Firebase-style does serial per-doc IDB reads/writes
      (like <code>persistentLocalCache</code> + <code>treeISOs</code>). Local-first mutates memory,
      then one snapshot write — the Supabase/PowerSync direction.
    </p>

    <div class="cols">
      <article>
        <h3>Firebase-style IDB</h3>
        <p>Docs: {firebaseCount}</p>
        {#if firebaseStats}
          <p data-testid="firebase-p50">p50 {firebaseStats.p50}ms · p95 {firebaseStats.p95}ms · mean {firebaseStats.mean}ms</p>
        {:else}
          <p data-testid="firebase-p50">Not run</p>
        {/if}
        <button type="button" data-testid="bench-firebase" disabled={!ready} onclick={runFirebaseBench}>
          Bench {BENCH_N} updates
        </button>
      </article>

      <article>
        <h3>Local-first (Supabase direction)</h3>
        <p>Docs: {localCount} · sync queue: <span data-testid="sync-queue">{syncQueued}</span></p>
        <p>task-0 name: <code data-testid="local-name">{lastLocalName || '—'}</code></p>
        {#if localStats}
          <p data-testid="local-p50">p50 {localStats.p50}ms · p95 {localStats.p95}ms · mean {localStats.mean}ms</p>
        {:else}
          <p data-testid="local-p50">Not run</p>
        {/if}
        <div class="actions">
          <button type="button" data-testid="bench-local" disabled={!ready} onclick={runLocalBench}>
            Bench {BENCH_N} updates
          </button>
          <button type="button" data-testid="toggle-offline" onclick={toggleOffline}>
            {offlineSim ? 'Go online' : 'Go offline'}
          </button>
          <button type="button" data-testid="mutate-offline" disabled={!ready} onclick={mutateOfflineOnce}>
            Offline mutate
          </button>
          <button type="button" data-testid="reload-disk" onclick={reloadFromDisk}>
            Reload from IDB
          </button>
        </div>
      </article>
    </div>
  </section>

  <section class="panel" aria-label="Loop log">
    <h2>Cold-start loop log</h2>
    <ol class="log" data-testid="loop-log">
      {#each loopLog as line}
        <li>{line}</li>
      {/each}
    </ol>
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
  }

  .lab {
    --ink: #1c1917;
    --muted: #57534e;
    --paper: #f7f4ef;
    --panel: rgba(255, 252, 248, 0.88);
    --line: #d6d3d1;
    --accent: #0f766e;
    --accent-2: #b45309;
    min-height: 100dvh;
    color: var(--ink);
    font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif;
    background:
      radial-gradient(1200px 600px at 10% -10%, #d8ebe6 0%, transparent 55%),
      radial-gradient(900px 500px at 100% 0%, #f3e0c8 0%, transparent 50%),
      linear-gradient(180deg, #f7f4ef 0%, #efe8dc 100%);
    padding: 1.25rem 1rem 3rem;
  }

  .hero {
    max-width: 42rem;
    margin: 0 auto 1.25rem;
  }

  .brand {
    margin: 0;
    font-size: clamp(2rem, 8vw, 3.25rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  h1 {
    margin: 0.35rem 0 0.5rem;
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--muted);
  }

  .lede {
    margin: 0;
    color: var(--muted);
    line-height: 1.45;
    max-width: 36rem;
  }

  .lede.tight {
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }

  .panel {
    max-width: 42rem;
    margin: 0 auto 1rem;
    padding: 1rem 1.1rem 1.15rem;
    background: var(--panel);
    border: 1px solid var(--line);
    backdrop-filter: blur(8px);
  }

  h2 {
    margin: 0 0 0.75rem;
    font-size: 1.05rem;
  }

  h3 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.65rem 1rem;
    margin: 0;
  }

  dt {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }

  dd {
    margin: 0.1rem 0 0;
    font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.92rem;
  }

  .status {
    margin: 0.85rem 0 0.75rem;
    color: var(--accent);
    font-size: 0.95rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  button {
    appearance: none;
    border: 1px solid var(--ink);
    background: var(--ink);
    color: #fafaf9;
    padding: 0.45rem 0.75rem;
    font: inherit;
    font-size: 0.9rem;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  button:nth-child(even) {
    background: transparent;
    color: var(--ink);
  }

  .cols {
    display: grid;
    gap: 1rem;
  }

  @media (min-width: 720px) {
    .cols {
      grid-template-columns: 1fr 1fr;
    }
  }

  article {
    padding-top: 0.25rem;
  }

  code {
    font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.85em;
  }

  .log {
    margin: 0;
    padding-left: 1.1rem;
    font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8rem;
    color: var(--muted);
    max-height: 12rem;
    overflow: auto;
  }
</style>
