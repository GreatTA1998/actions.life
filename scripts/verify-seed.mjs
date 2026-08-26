import { DateTime } from 'luxon'
import { buildSeedDocuments } from '../src/lib/db/seed.js'
import assert from 'node:assert/strict'

const fixed = DateTime.fromISO('2026-03-15T12:00:00')
const { tasks, templates, maxOrderValue } = buildSeedDocuments({
  maxOrderValue: 10,
  now: fixed
})

assert.equal(tasks.length, 11)
assert.equal(templates.length, 4)
assert.equal(maxOrderValue, 10 + 11 + 4)

const byId = Object.fromEntries(tasks.map(t => [t.id, t.data]))

assert.equal(byId['todo-drag'].rootID, 'getting-started')
assert.equal(byId['todo-drag'].parentID, 'getting-started')
assert.equal(byId['visa-startup'].rootID, 'visa')
assert.equal(byId['photo-bird'].startDateISO, '2026-03-15')
assert.equal(byId['photo-dog'].startDateISO, '2026-03-16')

// Family treeISOs must include every dated descendant
const visaISOs = byId['visa'].treeISOs
assert.ok(visaISOs.includes(byId['visa-startup'].startDateISO))
assert.ok(visaISOs.includes(byId['visa-renewal'].startDateISO))
assert.ok(visaISOs.includes(byId['visa-manager'].startDateISO))
assert.deepEqual(byId['visa-startup'].treeISOs, visaISOs)
assert.deepEqual(byId['visa-manager'].treeISOs, visaISOs)

assert.equal(templates[0].data.rootID, templates[0].id)
assert.ok(templates[0].data.previewSpan > 0)

console.log('seed builder ok', {
  tasks: tasks.length,
  templates: templates.length,
  maxOrderValue,
  visaISOs
})
