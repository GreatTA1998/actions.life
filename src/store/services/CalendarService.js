/**
 * Handles everything data-related for <Calendar/>, from snapshot listeners to tree building.
 * 
 * Assumes page.params.user is set
 */
import { DateTime } from 'luxon'
import Tasks from '/src/back-end/Tasks'
import { pureNumericalHourForm } from '/src/helpers/everythingElse.js'
import { tasksScheduledOn } from '../calendarStore.js'
import { doc, collection, writeBatch, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '/src/back-end/firestoreConnection'
import { size, cushion } from '/src/helpers/constants.js'
import { page } from '$app/stores'
import { get } from 'svelte/store'

const activeListeners = {}
const tasksCache = new Map()

export function setupInitialCalendarTasks () {
  const today = DateTime.now()
  const left = today.minus({ days: size + cushion })
  const right = today.plus({ days: size + cushion })
  
  setupCalListener(left, right)
}

export function setupCalListener (leftDT, rightDT) {  
  const leftISO = leftDT.toFormat('yyyy-MM-dd')
  const rightISO = rightDT.toFormat('yyyy-MM-dd')
  activeListeners[`${leftISO}_${rightISO}`] = listenToDateRange(leftISO, rightISO)

  console.log('active listeners', activeListeners)
}

function listenToDateRange (leftISO, rightISO) {
  return onSnapshot(
    query(
      collection(db, `/users/${get(page).params.user}/tasks`), 
      where('rootStartDateISO', '>=', leftISO),
      where('rootStartDateISO', '<=', rightISO)
    ),
    (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      updateTasksForDateRange(tasks, leftISO, rightISO)
    }, 
    (error) => {
      console.error('Error in listenToDateRange:', error)
    }
  )
}

export function updateTasksForDateRange (flatArray, startDate, endDate) {
  if (!flatArray?.length) return
  
  for (const task of flatArray) {
    tasksCache.set(task.id, task)
  }

  const forest = constructForest(flatArray)
  const dateMapping = computeDateToTasksDict(forest)
  
  tasksScheduledOn.update($tasksScheduledOn => {
    for (const [date, tasks] of Object.entries(dateMapping)) {
      $tasksScheduledOn[date] = tasks
    }
    return $tasksScheduledOn
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
  
  return Array.from(forest.values()).filter(tree => tree.startDateISO)
}

function computeDateToTasksDict (forest) {
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

/** Updates a calendar task and handles cascading updates to descendants */
export async function updateCalendarTask ({ uid, taskID, keyValueChanges }) {
  try {
    const task = tasksCache.get(taskID)
    if (!task) throw new Error(`Task ${taskID} not found in cache`)

    const isRescheduling = 'startDateISO' in keyValueChanges
    const isReparenting = 'parentID' in keyValueChanges
    const updatedChanges = { ...keyValueChanges }
    
    if (isRescheduling || isReparenting) {
      let newRootStartDateISO = task.rootStartDateISO
      
      if (isRescheduling && !task.parentID) {
        // Root node being rescheduled
        newRootStartDateISO = keyValueChanges.startDateISO || ''
      } else if (isReparenting) {
        if (keyValueChanges.parentID) {
          // Node being assigned a new parent
          const newParent = tasksCache.get(keyValueChanges.parentID)
          newRootStartDateISO = newParent?.rootStartDateISO || keyValueChanges.startDateISO || ''
        } else {
          // Node becoming a root
          newRootStartDateISO = keyValueChanges.startDateISO || task.startDateISO || ''
        }
      }
      
      if (newRootStartDateISO !== task.rootStartDateISO) {
        updatedChanges.rootStartDateISO = newRootStartDateISO
        
        await Promise.all([
          Tasks.updateTaskDoc({ userUID: uid, taskID, keyValueChanges: updatedChanges }),
          updateDescendantsRootStartDateISO(uid, taskID, newRootStartDateISO)
        ])
        
        return {
          taskID,
          changes: updatedChanges,
          rootStartDateISOChanged: true,
          originalTask: task
        }
      }
    }
    
    await Tasks.updateTaskDoc({ userUID: uid, taskID, keyValueChanges: updatedChanges })
    
    return {
      taskID,
      changes: updatedChanges,
      rootStartDateISOChanged: false,
      originalTask: task
    }
  } catch (error) {
    console.error('Error updating calendar task:', error)
    throw error
  }
}

async function updateDescendantsRootStartDateISO (uid, taskID, rootStartDateISO) {
  const children = Array.from(tasksCache.values()).filter(task => task.parentID === taskID)
  if (!children.length) return // base case
  
  const batch = writeBatch(db)
  
  children.forEach(child => {
    const childRef = doc(db, 'users', uid, 'tasks', child.id)
    batch.update(childRef, { rootStartDateISO })
  })
  
  await batch.commit()
  
  await Promise.all(children.map(child => 
    updateDescendantsRootStartDateISO(uid, child.id, rootStartDateISO)
  ))
}

export function cleanupCalendarListeners () {
  Object.entries(activeListeners).forEach(([key, unsubscribe]) => {
    if (typeof unsubscribe === 'function') {
      unsubscribe()
      console.log(`Cleaned up calendar listener for range ${key}`)
    }
  })
  
  Object.keys(activeListeners).forEach(key => delete activeListeners[key])
}

export default {
  setupInitialCalendarTasks,
  setupCalListener,
  updateTasksForDateRange,
  updateCalendarTask,
  cleanupCalendarListeners,
  tasksCache
} 