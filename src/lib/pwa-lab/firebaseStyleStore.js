/**
 * Firebase-style offline store.
 *
 * Mirrors how actions.life tree ops work today with Firestore persistence:
 * - each task is its own IndexedDB document
 * - treeISOs / rootID maintenance reads many docs, then writes many docs
 * - mutations await persistence before resolving (no optimistic UI)
 *
 * This is intentionally slower — it reproduces the sluggishness of
 * persistentLocalCache + serial getDoc/update patterns on Safari/WebKit IDB.
 */

import { openDb, reqToPromise, txDone } from './idb.js'

const DB_NAME = 'pwa-lab-firebase-style'
const STORE = 'tasks'

/** @typedef {{ id: string, name: string, parentID: string, rootID: string, orderValue: number, treeISOs: string[], startDateISO: string, updatedAt: number }} TaskDoc */

/**
 * @returns {Promise<IDBDatabase>}
 */
function getDb () {
  return openDb(DB_NAME, 1, (db) => {
    if (!db.objectStoreNames.contains(STORE)) {
      const store = db.createObjectStore(STORE, { keyPath: 'id' })
      store.createIndex('rootID', 'rootID', { unique: false })
    }
  })
}

/**
 * @param {string} id
 * @returns {Promise<TaskDoc | undefined>}
 */
async function getDoc (id) {
  const db = await getDb()
  const tx = db.transaction(STORE, 'readonly')
  const result = await reqToPromise(tx.objectStore(STORE).get(id))
  await txDone(tx)
  return result
}

/**
 * @param {string} rootID
 * @returns {Promise<TaskDoc[]>}
 */
async function getByRoot (rootID) {
  const db = await getDb()
  const tx = db.transaction(STORE, 'readonly')
  const index = tx.objectStore(STORE).index('rootID')
  const result = await reqToPromise(index.getAll(rootID))
  await txDone(tx)
  return result
}

/**
 * @param {TaskDoc[]} docs
 */
async function putAll (docs) {
  const db = await getDb()
  const tx = db.transaction(STORE, 'readwrite')
  const store = tx.objectStore(STORE)
  for (const doc of docs) store.put(doc)
  await txDone(tx)
}

/**
 * Seed a tree of `size` sibling tasks under one root (plus the root itself).
 * @param {number} size
 */
export async function seedFirebaseStyleTree (size = 40) {
  await clearFirebaseStyle()
  const now = Date.now()
  const rootId = 'root'
  /** @type {TaskDoc[]} */
  const docs = [{
    id: rootId,
    name: 'Root',
    parentID: '',
    rootID: rootId,
    orderValue: 0,
    treeISOs: [],
    startDateISO: '',
    updatedAt: now
  }]
  for (let i = 0; i < size; i++) {
    docs.push({
      id: `task-${i}`,
      name: `Task ${i}`,
      parentID: rootId,
      rootID: rootId,
      orderValue: i + 1,
      treeISOs: [],
      startDateISO: '',
      updatedAt: now
    })
  }
  await putAll(docs)
  return docs.length
}

export async function clearFirebaseStyle () {
  const db = await getDb()
  const tx = db.transaction(STORE, 'readwrite')
  tx.objectStore(STORE).clear()
  await txDone(tx)
}

/**
 * Rename one leaf and rewrite treeISOs across the whole family —
 * same shape as maintainTreeISOs / updateEntireTree.
 * @param {string} taskId
 * @param {string} newName
 * @param {string} [newDateISO]
 */
export async function firebaseStyleUpdateTree (taskId, newName, newDateISO = '2026-08-26') {
  const task = await getDoc(taskId)
  if (!task) throw new Error(`Missing task ${taskId}`)

  // Serial family fetch (like getSubtreeNodes via rootID query)
  const family = await getByRoot(task.rootID)

  // Simulate per-doc "getDocFromCache" amplification used in helpers
  const hydrated = []
  for (const node of family) {
    // Intentionally serial — matches await getFirestoreDoc(...) loops
    // eslint-disable-next-line no-await-in-loop
    const fresh = await getDoc(node.id)
    if (fresh) hydrated.push(fresh)
  }

  const prevDate = task.startDateISO
  const treeISOs = [...task.treeISOs]
  if (prevDate) {
    const idx = treeISOs.indexOf(prevDate)
    if (idx >= 0) treeISOs.splice(idx, 1)
  }
  if (newDateISO) treeISOs.push(newDateISO)

  const now = Date.now()
  const updated = hydrated.map((node) => {
    if (node.id === taskId) {
      return {
        ...node,
        name: newName,
        startDateISO: newDateISO,
        treeISOs,
        updatedAt: now
      }
    }
    return { ...node, treeISOs, updatedAt: now }
  })

  await putAll(updated)
  return updated.length
}

export async function listFirebaseStyle () {
  const db = await getDb()
  const tx = db.transaction(STORE, 'readonly')
  const all = await reqToPromise(tx.objectStore(STORE).getAll())
  await txDone(tx)
  return all.sort((a, b) => a.orderValue - b.orderValue)
}
