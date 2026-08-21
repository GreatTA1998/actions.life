import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createChunkedFlusher } from './chunkedFlusher.js'

function collectUploads () {
  const uploads = []
  const flusher = createChunkedFlusher({
    upload: async (path, json) => { uploads.push({ path, events: JSON.parse(json) }) },
    pathForChunk: (i) => `rrweb/uid/${String(i).padStart(6, '0')}.json`
  })
  return { flusher, uploads }
}

test('legacy flush re-stringifies the entire session on every tick', () => {
  const events = []
  const payloads = []
  const flush = () => events.length && payloads.push(JSON.stringify(events))

  for (let tick = 0; tick < 3; tick++) {
    for (let i = 0; i < 10; i++) events.push({ tick, i })
    flush()
  }

  const serializedCount = payloads.reduce((n, json) => n + JSON.parse(json).length, 0)
  assert.equal(events.length, 30, 'events stay in memory for the whole session')
  assert.equal(serializedCount, 60, 'tick 1+2+3 re-uploads 10+20+30 events')
})

test('flush uploads only unflushed events and clears them from memory', async () => {
  const { flusher, uploads } = collectUploads()

  for (let tick = 0; tick < 3; tick++) {
    for (let i = 0; i < 10; i++) flusher.push({ tick, i })
    await flusher.flush()
  }

  assert.equal(flusher.size, 0)
  assert.equal(uploads.length, 3)
  assert.deepEqual(uploads.map((u) => u.events.length), [10, 10, 10])
  assert.deepEqual(uploads.map((u) => u.path), [
    'rrweb/uid/000000.json',
    'rrweb/uid/000001.json',
    'rrweb/uid/000002.json'
  ])
  const serializedCount = uploads.reduce((n, u) => n + u.events.length, 0)
  assert.equal(serializedCount, 30)
})

test('empty flush is a no-op', async () => {
  const { flusher, uploads } = collectUploads()
  await flusher.flush()
  assert.equal(uploads.length, 0)
})

test('events that arrive during an in-flight upload are not in that chunk', async () => {
  let release
  const gate = new Promise((resolve) => { release = resolve })
  let started
  const startedGate = new Promise((resolve) => { started = resolve })
  const uploads = []
  const flusher = createChunkedFlusher({
    upload: async (path, json) => {
      started()
      await gate
      uploads.push({ path, events: JSON.parse(json) })
    },
    pathForChunk: (i) => String(i)
  })

  flusher.push({ id: 1 })
  const first = flusher.flush()
  await startedGate
  flusher.push({ id: 2 })
  release()
  await first

  assert.deepEqual(uploads[0].events, [{ id: 1 }])
  assert.equal(flusher.size, 1)

  await flusher.flush()
  assert.deepEqual(uploads[1].events, [{ id: 2 }])
  assert.equal(flusher.size, 0)
})

test('overlapping flushes serialize instead of double-uploading the same batch', async () => {
  const uploads = []
  let inflight = 0
  let maxInflight = 0
  const flusher = createChunkedFlusher({
    upload: async (path, json) => {
      inflight += 1
      maxInflight = Math.max(maxInflight, inflight)
      await new Promise((r) => setTimeout(r, 20))
      uploads.push(JSON.parse(json))
      inflight -= 1
    },
    pathForChunk: (i) => String(i)
  })

  flusher.push({ id: 1 })
  const a = flusher.flush()
  const b = flusher.flush()
  await Promise.all([a, b])

  assert.equal(uploads.length, 1)
  assert.deepEqual(uploads[0], [{ id: 1 }])
  assert.equal(maxInflight, 1)
})

test('long sessions upload linear bytes instead of rewriting the full array', async () => {
  const event = { type: 3, data: { x: 12, y: 34 }, timestamp: 1_700_000_000_000 }
  const ticks = 20
  const perTick = 25

  const legacy = []
  let legacyBytes = 0
  for (let t = 0; t < ticks; t++) {
    for (let i = 0; i < perTick; i++) legacy.push({ ...event, t, i })
    legacyBytes += JSON.stringify(legacy).length
  }

  let chunkedBytes = 0
  const flusher = createChunkedFlusher({
    upload: async (_path, json) => { chunkedBytes += json.length },
    pathForChunk: (i) => String(i)
  })
  for (let t = 0; t < ticks; t++) {
    for (let i = 0; i < perTick; i++) flusher.push({ ...event, t, i })
    await flusher.flush()
  }

  assert.equal(flusher.size, 0)
  assert.ok(legacyBytes > chunkedBytes * 5, `legacy ${legacyBytes}B vs chunked ${chunkedBytes}B`)
})

test('failed upload restores the batch and retries the same chunk path', async () => {
  const uploads = []
  let shouldFail = true
  const flusher = createChunkedFlusher({
    upload: async (path, json) => {
      if (shouldFail) {
        shouldFail = false
        throw new Error('network')
      }
      uploads.push({ path, events: JSON.parse(json) })
    },
    pathForChunk: (i) => `chunk-${i}`
  })

  flusher.push({ id: 1 })
  await flusher.flush()
  assert.equal(flusher.size, 1)
  assert.equal(uploads.length, 0)

  await flusher.flush()
  assert.equal(flusher.size, 0)
  assert.deepEqual(uploads, [{ path: 'chunk-0', events: [{ id: 1 }] }])
})
