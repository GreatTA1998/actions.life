import { writable, get } from 'svelte/store'
import { db } from '../back-end/firestoreConnection'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { reconstructTreeInMemory } from '../helpers/dataStructures.js'

let persistTasks, nonPersistTasks

export const lists = writable(null)
export const listTreesMap = writable(null) // listID --> array of task trees

export function listenToListsAndTasks (uid) {
  const tasksCollection = collection(db, `users/${uid}/tasks`)
  setupListener(
    query(tasksCollection, where('persistsOnList', '==', true), where('isArchived', '==', false)),
    data => persistTasks = data
  )
  setupListener(
    query(tasksCollection, where('persistsOnList', '==', false), where('startDateISO', '==', '')),
    data => nonPersistTasks = data
  )
  setupListener(
    collection(db, `users/${uid}/lists`), 
    data => lists.set(data)
  )
} 

function setupListener (ref, callback) {
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

function buildTreeMap (tasks) {
  // partition tasks by listID
  const d1 = {}
  for (const task of tasks) {
    if (!d1[task.listID]) d1[task.listID] = []
    d1[task.listID].push(task)
  }

  // tasks --> trees
  const d2 = {}
  for (const [listID, listTasks] of Object.entries(d1)) {
    d2[listID] = reconstructTreeInMemory(listTasks)
  }
  listTreesMap.set(d2)
}