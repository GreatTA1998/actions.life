import { DateTime } from 'luxon'
import Tasks from '/src/back-end/Tasks'
import { pureNumericalHourForm } from '/src/helpers/everythingElse.js'
import { tasksScheduledOn } from '../calendarStore.js'
import { doc, collection, writeBatch, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '/src/back-end/firestoreConnection'
import { size, cushion } from '/src/helpers/constants.js'

const activeListeners = {}
const tasksCache = new Map()

export function setupInitialCalendarTasks(uid) {
  const today = DateTime.now()
  const left = today.minus({ days: size + cushion })
  const right = today.plus({ days: size + cushion })
  
  setupCalListener(uid, left, right)
}

export function setupCalListener (uid, leftDT, rightDT) {
  const leftISO = leftDT.toFormat('yyyy-MM-dd')
  const rightISO = rightDT.toFormat('yyyy-MM-dd')
  activeListeners[`${leftISO}_${rightISO}`] = listenToDateRange(uid, leftISO, rightISO)

  console.log('active listeners', activeListeners)
}

function listenToDateRange (userUID, leftISO, rightISO) {
  return onSnapshot(
    query(
      collection(db, `/users/${userUID}/tasks`), 
      where('rootStartDateISO', '>=', leftISO),
      where('rootStartDateISO', '<=', rightISO)
    ),
    (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      updateTasksForDateRange(tasks, leftISO, rightISO)
    }, 
    (error) => {
      console.error('Error in listenToDateRange', error)
    }
  )
}

export function updateTasksForDateRange (flatArray, startDate, endDate) {
  if (!flatArray || !Array.isArray(flatArray) || flatArray.length === 0) {
    return
  }

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

/**
 * Constructs subtrees for every scheduled node in a given date range
 * Because of aliasing, the forest builds properly despite that the nodes aren't processed in any particular order
 * @param {Array} firestoreTaskDocs - All necessary tasks to reconstruct scheduled tasks and their subtrees
 * @returns {Array} - Array of trees, detached subtrees etc. where each subtree's root has a `startDateISO
 */
function constructForest (firestoreTaskDocs) {
  const forest = new Map()
  for (const task of firestoreTaskDocs) {
    forest.set(task.id, { ...task, children: [] })
  }
  for (const tree of forest.values()) {
    if (tree.parentID && forest.has(tree.parentID)) { // you can deprecate `forest.has(tree.parentID)` iff `rootStartDateISO` is correctly set for all tasks
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
  
  // Sort tasks with startTime for predictable drag behavior
  for (const [key, value] of Object.entries(dateToTasks)) {
    if (value.hasStartTime && value.hasStartTime.length > 0) {
      value.hasStartTime = value.hasStartTime.sort((a, b) => {
        return pureNumericalHourForm(a.startTime) - pureNumericalHourForm(b.startTime)
      })
    }
  }
  return dateToTasks
}

function addTaskToDate(task, date, dateToTasks) {
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

export async function updateCalendarTask({ uid, taskID, keyValueChanges }) {
  try {
    const task = tasksCache.get(taskID)

    const isRescheduling = keyValueChanges.startDateISO !== undefined
    const isReparenting = keyValueChanges.parentID !== undefined
    let updatedChanges = { ...keyValueChanges }
    
    if (isRescheduling || isReparenting) {
      let newRootStartDateISO = task.rootStartDateISO
      
      // If this is a root node being rescheduled, update its rootStartDateISO
      if (isRescheduling && (!task.parentID || task.parentID === '')) {
        newRootStartDateISO = keyValueChanges.startDateISO || ''
      }
      // If this is a node being re-parented, update its rootStartDateISO based on new parent
      else if (isReparenting && keyValueChanges.parentID) {
        const newParent = tasksCache.get(keyValueChanges.parentID)
        if (newParent && newParent.rootStartDateISO) {
          newRootStartDateISO = newParent.rootStartDateISO
        } else if (keyValueChanges.startDateISO) {
          newRootStartDateISO = keyValueChanges.startDateISO
        }
      }

      // If node is becoming a root node (parentID set to empty), use its own startDateISO
      else if (isReparenting && (!keyValueChanges.parentID || keyValueChanges.parentID === '')) {
        newRootStartDateISO = keyValueChanges.startDateISO || task.startDateISO
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
    
    // If we didn't update rootStartDateISO, just update the task
    await Tasks.updateTaskDoc({ userUID: uid, taskID, keyValueChanges: updatedChanges })
    
    // Return information about what changed
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

async function updateDescendantsRootStartDateISO(uid, taskID, rootStartDateISO) {
  const calTasks = new Array(...tasksCache.values())
  const children = calTasks.filter(task => task.parentID === taskID)
  if (children.length === 0) { // base case
    return
  }
  const batch = writeBatch(db)
  
  // Update each child and recursively update their descendants
  const updatePromises = children.map(async child => {
    const childRef = doc(db, 'users', uid, 'tasks', child.id)
    batch.update(childRef, { rootStartDateISO })
    
    // Recursively update this child's descendants
    await updateDescendantsRootStartDateISO(uid, child.id, rootStartDateISO)
  })
  
  await Promise.all(updatePromises)
  
  await batch.commit()
  console.log(`Updated rootStartDateISO for ${children.length} direct children of task ${taskID}`)
}

export function cleanupCalendarListeners() {
  Object.entries(activeListeners).forEach(([key, unsubscribe]) => {
    if (typeof unsubscribe === 'function') {
      unsubscribe()
      console.log(`Cleaned up calendar listener for range ${key}`)
    }
  })
  activeListeners = {}
}

// should use an independent data structure as future tasks do overlap with the calendar tasks
export function setupFutureOverviewTasks(uid, hideRoutines = false) {
  const today = DateTime.now().startOf('day')
  const futureDate = today.plus({ days: 30 })
  // (tasks) => {
  //   let filteredTasks = tasks
  //   if (hideRoutines) {
  //     filteredTasks = tasks.filter(task => task.templateID === '')
  //   }
  // }
}

export async function setupMobileCalendarTasks(uid) {
  const today = DateTime.now()
  const leftDate = today.minus({ days: 7 })
  const rightDate = today.plus({ days: 7 })
  
  setupCalListener(uid, leftDate, rightDate)
  return Promise.resolve()
}

export default {
  setupInitialCalendarTasks,
  setupMobileCalendarTasks,
  setupFutureOverviewTasks,
  setupCalListener,
  updateTasksForDateRange,
  updateCalendarTask,
  cleanupCalendarListeners,
  tasksCache
} 