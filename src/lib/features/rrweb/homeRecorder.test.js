import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

const caseFile = fileURLToPath(new URL('./homeRecorder.case.mjs', import.meta.url))

function runCase (name) {
  const result = spawnSync(process.execPath, [caseFile], {
    env: { ...process.env, HOMERECORDER_CASE: name },
    encoding: 'utf8'
  })
  assert.equal(result.status, 0, result.stderr || result.stdout)
  return JSON.parse(result.stdout.trim().split('\n').at(-1))
}

test('does not persist the once-flag before rrweb import resolves', () => {
  const result = runCase('before-import')
  assert.equal(result.localStorageSetBeforeImport, false)
  assert.deepEqual(result.unhandled, [])
})

test('failed rrweb import is caught and does not persist the once-flag', () => {
  const result = runCase('failed-import')
  assert.equal(result.localStorageSetAfterFail, false)
  assert.equal(result.intervalCount, 0)
  assert.deepEqual(result.unhandled, [])
})

test('denied Storage writes are caught and do not persist the once-flag', () => {
  const result = runCase('denied-upload')
  assert.equal(result.intervalStarted, true)
  assert.ok(result.uploads >= 2)
  assert.equal(result.localStorageSet, false)
  assert.deepEqual(result.unhandled, [])
})

test('persists the once-flag only after a successful upload', () => {
  const result = runCase('success')
  assert.equal(result.localStorageSetBeforeFlush, false)
  assert.equal(result.localStorageSetAfterFlush, true)
  assert.ok(result.uploads >= 1)
  assert.deepEqual(result.unhandled, [])
})
