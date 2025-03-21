/** Handles everything data-related for <Calendar/>, from snapshot listeners to tree building. */
import { treesByDate, treesByID } from './store.js'
import { updateCache } from '/src/lib/store'
import { DateTime } from 'luxon'
import { pureNumericalHourForm } from '/src/lib/utils/core.js'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '/src/lib/db/init'
import { page } from '$app/stores'
import { get } from 'svelte/store'

const listeners = {}

export function setupCalListener (leftDT, rightDT) {  
  const leftISO = leftDT.toFormat('yyyy-MM-dd')
  const rightISO = rightDT.toFormat('yyyy-MM-dd')
  
  const FIREBASE_ARRAY_CONTAINS_ANY_LIMIT = 10
  const regions = divideIntoRegions(leftISO, rightISO, FIREBASE_ARRAY_CONTAINS_ANY_LIMIT)
  
  for (const dateISOs of regions) { 
    const n = dateISOs.length
    listeners[`${dateISOs[0]}_${dateISOs[n - 1]}`] = listenToRegion(dateISOs)
  }
}

function divideIntoRegions (leftISO, rightISO, chunkSize = 10) {
  const chunks = []
  let currentChunk = []
  let currentDate = DateTime.fromISO(leftISO)
  const endDate = DateTime.fromISO(rightISO)
  
  while (currentDate <= endDate) {
    const dateString = currentDate.toFormat('yyyy-MM-dd')
    currentChunk.push(dateString)
    
    if (currentChunk.length === chunkSize) {
      chunks.push([...currentChunk])
      currentChunk = []
    }
    
    currentDate = currentDate.plus({ days: 1 })
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }
  
  return chunks
}

function listenToRegion (dateISOs) {
  return onSnapshot(
    query(
      collection(db, `/users/${get(page).params.user}/tasks`), 
      where('treeISOs', 'array-contains-any', dateISOs)
    ),
    (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      rebuildRegion(tasks, dateISOs)
    }, 
    (error) => {
      console.error('Error in listenToDateChunk:', error)
    }
  )
}

export function rebuildRegion (regionTasks, dateISOs) {
  updateCache(regionTasks)

  // only the scheduled tasks are strictly within the reigion,
  // as the query include tasks arbitrarily spread out over time
  const regionForest = constructForest(regionTasks)
  const scheduledTrees = regionForest.filter(task => task.startDateISO)
  const scheduledTreeGroups = organizeToGroups(scheduledTrees)
  
  treesByDate.update(dict => {
    // note tasks with dates outside the region will break it for some reason
    for (const [date, treeGroups] of Object.entries(scheduledTreeGroups)) {
      if (!dateISOs.includes(date)) {
        // console.log('found a strange date, dateISOs =', date, dateISOs, treeGroups)
        continue
      }
      dict[date] = treeGroups
    }
    return dict
  })
}

function constructForest (firestoreTaskDocs) {
  const forest = new Map()
  
  // First pass: create all nodes
  for (const task of firestoreTaskDocs) {
    forest.set(task.id, { ...task, children: [] })
  }
  
  // Second pass: build the forest (note: due to aliasing, we don't need to process nodes in topological order)
  for (const tree of forest.values()) {
    if (tree.parentID && forest.has(tree.parentID)) { // you can deprecate `forest.has(tree.parentID)` when `rootStartDateISO` is correctly set for all tasks
      forest.get(tree.parentID).children.push(tree)
    }
  }

  treesByID.update(dict => {
    for (const [id, tree] of forest) {
      dict[id] = tree
    }
    return dict
  })

  return Array.from(forest.values())
}

function organizeToGroups (forest) {
  const dateToTasks = {}
  
  forest.forEach(tree => {
    addTaskToDate(tree, tree.startDateISO, dateToTasks)
  })
  
  // Ensure consistent drag-behavior for overlapping tasks (later elements are "on top" due to HTML stacking order)
  for (const taskGroups of Object.values(dateToTasks)) {
    if (taskGroups.hasStartTime?.length > 0) {
      taskGroups.hasStartTime.sort((a, b) => 
        pureNumericalHourForm(a.startTime) - pureNumericalHourForm(b.startTime)
      )
    }
  }
  
  return dateToTasks
}

function addTaskToDate (task, date, dateToTasks) {
  if (!dateToTasks[date]) {
    dateToTasks[date] = { 
      hasStartTime: [], 
      noStartTime: { 
        hasIcon: [], 
        noIcon: [] 
      } 
    }
  }
  
  if (task.startTime) dateToTasks[date].hasStartTime.push(task)
  else if (task.iconURL) dateToTasks[date].noStartTime.hasIcon.push(task)
  else dateToTasks[date].noStartTime.noIcon.push(task)
}

export default {
  setupCalListener
} 