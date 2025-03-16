import { get } from 'svelte/store'
import { tasksCache } from '/src/store'
import { doc, collection, writeBatch, getDocs } from 'firebase/firestore'
import { db } from '/src/back-end/firestoreConnection'

export async function updateTreeISOsForDateChange(uid, task, oldDate, newDate, batch) {
  const rootTask = findRootTask(task)
  const allTreeTasks = getAllTasksInTree(rootTask.id)
  const currentDates = rootTask.treeISOs || []
  
  console.log('rootTask, oldDate, newDate =', rootTask, oldDate, newDate)
  let updatedDates = oldDate ? 
    removeOneInstance(currentDates, oldDate) : 
    [...currentDates]

  console.log("updatedDates should remain the same =", updatedDates)
  
  if (newDate) updatedDates.push(newDate)
  
  for (const treeTask of allTreeTasks) {
    const taskRef = doc(db, 'users', uid, 'tasks', treeTask.id)
    console.log("update ", treeTask.name, updatedDates)
    batch.update(taskRef, { treeISOs: updatedDates })
  }
}

export async function handleReparentingTreeISOs(uid, task, oldParentID, newParentID, batch) {
  // Find the root tasks for old and new parent trees
  const oldRootTask = oldParentID ? findRootTask(get(tasksCache)[oldParentID]) : null
  const newRootTask = newParentID ? findRootTask(get(tasksCache)[newParentID]) : task
  
  // Get all tasks in each tree
  const oldTreeTasks = oldRootTask ? getAllTasksInTree(oldRootTask.id) : []
  const newTreeTasks = getAllTasksInTree(newRootTask.id)
  const movingSubtreeTasks = getAllTasksInTree(task.id)
  
  // Get all dates from the moving subtree
  const movingDates = movingSubtreeTasks
    .filter(t => t.startDateISO)
    .map(t => t.startDateISO)
  
  // Handle the old parent tree - remove dates from the moving subtree
  if (oldRootTask) {
    let updatedOldDates = [...(oldRootTask.treeISOs || [])]
    
    // Remove exactly ONE instance of each moving date
    for (const date of movingDates) {
      updatedOldDates = removeOneInstance(updatedOldDates, date)
    }
    
    // Update all tasks in the old tree (except those being moved)
    for (const oldTask of oldTreeTasks) {
      if (!movingSubtreeTasks.some(t => t.id === oldTask.id)) {
        const taskRef = doc(db, 'users', uid, 'tasks', oldTask.id)
        batch.update(taskRef, { treeISOs: updatedOldDates })
      }
    }
  }
  
  // Handle the new parent tree - add dates from the moving subtree
  if (newParentID) {
    // Get current dates from the new parent tree
    const newTreeDates = newRootTask.treeISOs || []
    
    // Combine with dates from the moving subtree
    const updatedNewDates = [...newTreeDates, ...movingDates]
    
    // Update all tasks in the new parent tree
    for (const newTask of newTreeTasks) {
      const taskRef = doc(db, 'users', uid, 'tasks', newTask.id)
      batch.update(taskRef, { treeISOs: updatedNewDates })
    }
    
    // Update all tasks in the moving subtree
    for (const movingTask of movingSubtreeTasks) {
      const taskRef = doc(db, 'users', uid, 'tasks', movingTask.id)
      batch.update(taskRef, { treeISOs: updatedNewDates })
    }
  } else {
    // If there's no new parent, the moving subtree becomes a root
    // It should only contain its own dates
    
    // Update all tasks in the moving subtree
    for (const movingTask of movingSubtreeTasks) {
      const taskRef = doc(db, 'users', uid, 'tasks', movingTask.id)
      batch.update(taskRef, { treeISOs: movingDates })
    }
  }
}

export function findRootTask(task) {
  let currentTask = task
  
  while (currentTask.parentID) {
    const parent = get(tasksCache)[currentTask.parentID]
    if (!parent) break
    
    currentTask = parent
  }
  
  return currentTask
}

/** Get all tasks in a tree (including the root) */
export function getAllTasksInTree(rootID) {
  return getDescendantTasks(rootID)
}

/**
 * Get all descendants of a task (including the task itself)
 */
export function getDescendantTasks(taskID) {
  const descendants = []
  const queue = [taskID]
  
  while (queue.length > 0) {
    const currentID = queue.shift()
    const task = get(tasksCache)[currentID]
    
    if (task) {
      descendants.push(task)
      
      const children = Object.values(get(tasksCache))
        .filter(t => t.parentID === currentID)
      
      queue.push(...children.map(child => child.id))
    }
  }
  
  return descendants
}

export function removeOneInstance(array, item) {
  const index = array.indexOf(item)
  if (index === -1) return [...array]
  return [...array.slice(0, index), ...array.slice(index + 1)]
}

// For backward compatibility
export async function updateTreeISOsForEntireTree(uid, task, oldDate, newDate, batch) {
  await updateTreeISOsForDateChange(uid, task, oldDate, newDate, batch)
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