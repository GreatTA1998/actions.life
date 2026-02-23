import { writable } from 'svelte/store'
import { db } from '$lib/db/init'
import { updateCache, cleanupCache } from '$lib/store'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { buildForest } from '$lib/db/tree.ts'

let persistTasks
const unsubFuncs = []

export const trees = writable(null)

export function listenToTasks (uid) {
  const tasksCollection = collection(db, `users/${uid}/tasks`)
  setupListener(
    query(tasksCollection, where('persistsOnList', '==', true), where('isArchived', '==', false)),
    data => { 
      persistTasks = data 
      updateCache(persistTasks)
    }
  )
}

function setupListener (ref, callback) {
  unsubFuncs.push(
    onSnapshot(ref, snapshot => {
      const mappedData = snapshot.docs.map(doc => ({
        ...doc.data(), 
        id: doc.id
      }))
      
      callback(mappedData)
  
      if (persistTasks) {
        buildTreeMap(persistTasks)
      }
    })
  )
}

function buildTreeMap (tasks) {
  trees.set(
    buildForest(tasks)
  )
}

// TO-DO: bugged, unused for now
export function cleanup () {
  for (const unsub of unsubFuncs) {
    unsub()
  }
  cleanupCache(persistTasks)
  trees.set(null)
}