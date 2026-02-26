import { buildForest, findSubtree } from '$lib/db/tree.ts'
import { get, writable } from 'svelte/store'
import { user } from '$lib/store'
import { tasksCache, updateCache } from './tasksCache.js'
import { onSnapshot, query, collection, where } from 'firebase/firestore'
import { db } from '$lib/db/init.js'

export const clickedTaskID = writable('')
export const familyTree = writable(null)

let unsub = () => {}

clickedTaskID.subscribe($clickedTaskID => listenToAncestralTree($clickedTaskID))

export function openTaskPopup (task) {
  clickedTaskID.set(task.id)
}

export function closeTaskPopup() {
  clickedTaskID.set('')
}

function listenToAncestralTree (id) {
  unsub()
  
  if (!id) return

  const task = get(tasksCache)[id]
  
  unsub = onSnapshot(
    query(
      collection(db, `users/${get(user).uid}/tasks`),
      where('rootID', '==', task.rootID)
    ),
    snapshot => {
      const tasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      updateCache(tasks)

      if (!tasks.find(task => task.id === id)) return 

      const [ancestralTree] = buildForest(tasks)
      const family = findSubtree({ id, tree: ancestralTree })
      familyTree.set(family)
    }
  )
}