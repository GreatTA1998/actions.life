import { writable, get } from 'svelte/store'
import { db } from '/src/db/init'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { updateCache } from '/src/store'

// We'll need to fix this circular dependency later
import { reconstructTreeInMemory } from './todoService.js'

let persistTasks, nonPersistTasks

export const lists = writable(null)
export const listTreesMap = writable(null) // listID --> array of task trees

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
    query(tasksCollection, where('persistsOnList', '==', false), where('startDateISO', '==', '')),
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

    if (persistTasks && nonPersistTasks && get(lists)) {
      buildTreeMap([...persistTasks, ...nonPersistTasks])
    }
  })
}

function buildTreeMap(tasks) {
  // group tasks by `listID` first
  const d1 = {}
  for (const task of tasks) {
    if (!d1[task.listID]) d1[task.listID] = []
    d1[task.listID].push(task)
  }

  const d2 = {}
  // ensure all lists are present on the map, even if no tasks belong there, 
  // otherwise the inconsistent data structure will cause reactivity to fail at the component level
  for (const list of get(lists)) {
    d2[list.id] = []
  }
  for (const [listID, listTasks] of Object.entries(d1)) {
    d2[listID] = reconstructTreeInMemory(listTasks)
  }
  listTreesMap.set(d2)
} 