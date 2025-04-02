import { writable, get } from 'svelte/store'
import { db } from '/src/lib/db/init'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { updateCache } from '/src/lib/store'

// We'll need to fix this circular dependency later
import { reconstructTreeInMemory } from './todoService.js'

let persistTasks, nonPersistTasks

export const lists = writable(null)
export const listTreesMap = writable(null) // listID --> array of task trees
export const trees = writable(null)

export function listenToListsAndTasks(uid) {
  const tasksCollection = collection(db, `users/${uid}/tasks`)
  setupListener(
    query(tasksCollection, where('persistsOnList', '==', true), where('isArchived', '==', false)),
    data => { 
      persistTasks = data 
      updateCache(persistTasks)
    }
  )
  setupListener(
    query(tasksCollection, where('persistsOnList', '==', false), where('startDateISO', '==', ''), where('isArchived', '==', false)),
    data => { 
      nonPersistTasks = data 
      updateCache(nonPersistTasks)
    }
  )
  setupListener(
    collection(db, `users/${uid}/lists`), 
    data => lists.set(data)
  )
} 

function setupListener(ref, callback) {
  onSnapshot(ref, snapshot => {
    const mappedData = snapshot.docs.map(doc => ({
      ...doc.data(), 
      id: doc.id
    }))
    
    callback(mappedData)

    if (persistTasks && nonPersistTasks) {
      buildTreeMap([...persistTasks, ...nonPersistTasks])
    }
  })
}

function buildTreeMap(tasks) {
  // reconstructTreeInMemory is really constructing a forest
  const result = reconstructTreeInMemory(tasks)
  trees.set(result)
} 