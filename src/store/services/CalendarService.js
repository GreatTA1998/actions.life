/** Handles everything data-related for <Calendar/>, from snapshot listeners to tree building. */
import { treesByDate, treesByID } from '../calendarStore.js'
import { tasksCache, updateCache } from '/src/store'
import { DateTime } from 'luxon'
import { pureNumericalHourForm } from '/src/helpers/everythingElse.js'
import { doc, collection, writeBatch, query, where, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '/src/back-end/firestoreConnection'
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

function divideIntoRegions(leftISO, rightISO, chunkSize = 10) {
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
        console.log('found a strange date, dateISOs =', date, dateISOs, treeGroups)
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

/** Updates a calendar task and handles cascading updates to descendants */
export async function updateCalendarTask ({ uid, taskID, keyValueChanges }) {
  try {
    console.log("updateCalendarTask", { uid, taskID, keyValueChanges })
    const task = get(tasksCache)[taskID]
    const batch = writeBatch(db)

    const isRescheduling = 'startDateISO' in keyValueChanges
    const isReparenting = 'parentID' in keyValueChanges
    
    if (isRescheduling) {
      const oldDate = task.startDateISO
      const newDate = keyValueChanges.startDateISO
      if (oldDate !== newDate) {
        updateTreeISOsForTaskAndAncestors(uid, task, oldDate, newDate, batch)
      }
    }
    
    if (isReparenting) {
      const oldParentID = task.parentID
      const newParentID = keyValueChanges.parentID
      if (oldParentID !== newParentID) {
        handleReparentingTreeISOs(uid, task, oldParentID, newParentID, batch)
      }
    }
     
    batch.update(doc(db, 'users', uid, 'tasks', taskID), keyValueChanges)
    await batch.commit()
  } catch (error) {
    console.error('Error updating calendar task:', error)
    throw error
  }
}

async function updateTreeISOsForTaskAndAncestors(uid, task, oldDate, newDate, batch) {
  // Get all ancestors including this task
  const ancestors = getAncestorChain(task)
  
  for (const ancestor of ancestors) {
    const ancestorRef = doc(db, 'users', uid, 'tasks', ancestor.id)
    const currentTreeISOs = ancestor.treeISOs || []
    
    // Remove old date if it exists
    const updatedTreeISOs = oldDate ? 
      currentTreeISOs.filter(date => date !== oldDate) : 
      [...currentTreeISOs]
    
    // Add new date if it's not already there
    if (newDate && !updatedTreeISOs.includes(newDate)) {
      updatedTreeISOs.push(newDate)
    }
    
    batch.update(ancestorRef, { treeISOs: updatedTreeISOs })
  }
}

/** Gets a chain of ancestors for a task, including the task itself */
function getAncestorChain(task) {
  const ancestors = [task]
  let currentTask = task
  
  while (currentTask.parentID) {
    const parent = get(tasksCache)[currentTask.parentID]
    if (!parent) break
    
    ancestors.push(parent)
    currentTask = parent
  }
  
  return ancestors
}

async function handleReparentingTreeISOs (uid, task, oldParentID, newParentID, batch) {
  const taskDate = task.startDateISO
  if (!taskDate) return // No date to update
  
  // Get all descendants of this task (including itself)
  const descendants = getDescendantTasks(task.id)
  const descendantDates = [...new Set(
    descendants
      .filter(t => t.startDateISO)
      .map(t => t.startDateISO)
  )]
  
  // Update old parent chain - remove all descendant dates
  if (oldParentID) {
    const oldParent = get(tasksCache)[oldParentID]
    if (oldParent) {
      const oldAncestors = getAncestorChain(oldParent)
      updateAncestorsRemoveDates(uid, oldAncestors, descendantDates, batch)
    }
  }
  
  // Update new parent chain - add all descendant dates
  if (newParentID) {
    const newParent = get(tasksCache)[newParentID]
    if (newParent) {
      const newAncestors = getAncestorChain(newParent)
      updateAncestorsAddDates(uid, newAncestors, descendantDates, batch)
    }
  }
}

function getDescendantTasks (taskID) {
  const descendants = []
  const queue = [taskID]
  
  while (queue.length > 0) {
    const currentID = queue.shift()
    const task = get(tasksCache)[currentID]
    
    if (task) {
      descendants.push(task)
      
      // Add children to queue
      const children = Object.values(get(tasksCache))
        .filter(t => t.parentID === currentID)
      
      queue.push(...children.map(child => child.id))
    }
  }
  
  return descendants
}

/** Updates ancestors to remove dates from their treeISOs arrays */
async function updateAncestorsRemoveDates(uid, ancestors, datesToRemove) {
  for (const ancestor of ancestors) {
    const ancestorRef = doc(db, 'users', uid, 'tasks', ancestor.id)
    const currentTreeISOs = ancestor.treeISOs || []
    
    // Remove dates that are in the datesToRemove array
    const updatedTreeISOs = currentTreeISOs.filter(date => !datesToRemove.includes(date))
    
    batch.update(ancestorRef, { treeISOs: updatedTreeISOs })
  }
}

/** Updates ancestors to add dates to their treeISOs arrays */
async function updateAncestorsAddDates(uid, ancestors, datesToAdd, batch) {  
  for (const ancestor of ancestors) {
    const ancestorRef = doc(db, 'users', uid, 'tasks', ancestor.id)
    const currentTreeISOs = ancestor.treeISOs || []
    
    // Add dates that aren't already in the array
    const updatedTreeISOs = [...currentTreeISOs]
    
    for (const date of datesToAdd) {
      if (!updatedTreeISOs.includes(date)) {
        updatedTreeISOs.push(date)
      }
    }
    
    batch.update(ancestorRef, { treeISOs: updatedTreeISOs })
  }
}

/**
 * Migrates existing tasks to use the treeISOs field
 * This function should be manually called from the console
 * 
 * Usage:
 * import { migrateToTreeISOs } from '/src/store/services/CalendarService.js'
 * migrateToTreeISOs('user123', true) // Dry run
 * migrateToTreeISOs('user123') // Actual migration
 * 
 * @param {string} uid - User ID to migrate
 * @param {boolean} dryRun - If true, only simulates the migration without writing
 * @returns {Promise<Object>} Migration results
 */
export async function migrateToTreeISOs(uid, dryRun = false) {
  try {
    console.log(`${dryRun ? 'SIMULATION' : 'STARTING'} migration to treeISOs for user ${uid}`)
    
    // 1. Fetch all tasks for the user
    const tasksSnapshot = await getDocs(collection(db, `users/${uid}/tasks`))
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    console.log(`Found ${tasks.length} tasks to process`)
    
    // 2. Build the task hierarchy
    const taskMap = new Map()
    tasks.forEach(task => taskMap.set(task.id, { ...task, children: [] }))
    
    // Connect parents and children
    taskMap.forEach(task => {
      if (task.parentID && taskMap.has(task.parentID)) {
        taskMap.get(task.parentID).children.push(task)
      }
    })
    
    // 3. Find root tasks (no parent or parent not in our dataset)
    const rootTasks = Array.from(taskMap.values())
      .filter(task => !task.parentID || !taskMap.has(task.parentID))
    console.log(`Found ${rootTasks.length} root tasks`)
    
    // 4. Process each tree starting from roots
    const batchSize = 500 // Firestore batch limit
    let operationCount = 0
    let tasksToUpdate = 0
    let currentBatch = dryRun ? null : writeBatch(db)
    
    // Process each tree
    for (const rootTask of rootTasks) {
      const result = await processTreeForMigration(
        rootTask, 
        taskMap, 
        uid, 
        currentBatch, 
        dryRun,
        () => {
          operationCount++
          tasksToUpdate++
          
          if (!dryRun && operationCount >= batchSize) {
            // Commit current batch and start a new one
            console.log(`Committing batch of ${operationCount} operations`)
            currentBatch.commit()
            currentBatch = writeBatch(db)
            operationCount = 0
          }
        }
      )
    }
    
    // Commit any remaining operations
    if (!dryRun && operationCount > 0) {
      console.log(`Committing final batch of ${operationCount} operations`)
      await currentBatch.commit()
    }
    
    const message = dryRun 
      ? `DRY RUN COMPLETE: ${tasksToUpdate} tasks would be updated` 
      : `MIGRATION COMPLETE: ${tasksToUpdate} tasks updated`
    
    console.log(message)
    
    return { 
      success: true, 
      message, 
      tasksToUpdate,
      dryRun
    }
  } catch (error) {
    console.error(`ERROR during ${dryRun ? 'dry run' : 'migration'} to treeISOs:`, error)
    return { 
      success: false, 
      error: error.message,
      dryRun
    }
  }
}

/** Processes a tree for migration, calculating treeISOs for each node */
async function processTreeForMigration(task, taskMap, uid, batch, dryRun, incrementCounter) {
  // Skip tasks without dates
  if (!task.startDateISO) return { dates: [] }
  
  // Process children first to collect all dates
  let allDates = [task.startDateISO]
  
  // Process each child and collect their dates
  for (const child of task.children) {
    const childResult = await processTreeForMigration(
      child, taskMap, uid, batch, dryRun, incrementCounter
    )
    allDates = [...allDates, ...childResult.dates]
  }
  
  // Remove duplicates
  const uniqueDates = [...new Set(allDates)]
  
  // Check if update is needed
  const currentTreeISOs = task.treeISOs || []
  const needsUpdate = !arraysEqual(currentTreeISOs.sort(), uniqueDates.sort())
  
  if (needsUpdate) {
    // Update the task with treeISOs
    if (!dryRun) {
      const taskRef = doc(db, `users/${uid}/tasks`, task.id)
      batch.update(taskRef, { treeISOs: uniqueDates })
    }
    incrementCounter()
  }
  
  return { dates: uniqueDates }
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export default {
  setupCalListener,
  updateCalendarTask,
  migrateToTreeISOs
}