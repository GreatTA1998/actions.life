import { writable } from 'svelte/store'
import { db } from '$lib/db/init'
import { updateCache } from '$lib/store'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

let persistTasks

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
}

function buildTreeMap(tasks) {
  // reconstructTreeInMemory is really constructing a forest
  const result = reconstructTreeInMemory(tasks)
  trees.set(result)
} 

export function reconstructTreeInMemory (firestoreTaskDocs) {
  const memoryTree = []

  const memo = { '': [] }
  for (const node of firestoreTaskDocs) {
    if (!memo[node.parentID]) memo[node.parentID] = []
    if (!memo[node.id]) memo[node.id] = []
    memo[node.parentID].push(node)
  }

  const roots = memo[''].sort((a, b) => a.orderValue - b.orderValue)
  for (const root of roots) {
    extendTree(root, memo)
    memoryTree.push(root)
  }
  return memoryTree
}

function extendTree(node, memo) {
  node.children = memo[node.id]
  node.children = node.children.sort((a, b) => a.orderValue - b.orderValue)
  for (const child of node.children) {
    extendTree(child, memo)
  }
}