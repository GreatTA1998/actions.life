/**
 * Tiny IndexedDB promise wrapper used by the PWA lab stores.
 * Avoids pulling Dexie just for the proof-of-concept.
 */

/**
 * @param {string} name
 * @param {number} version
 * @param {(db: IDBDatabase) => void} onUpgrade
 * @returns {Promise<IDBDatabase>}
 */
export function openDb (name, version, onUpgrade) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version)
    req.onupgradeneeded = () => onUpgrade(req.result)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/**
 * @template T
 * @param {IDBRequest<T>} request
 * @returns {Promise<T>}
 */
export function reqToPromise (request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * @param {IDBTransaction} tx
 * @returns {Promise<void>}
 */
export function txDone (tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'))
  })
}
