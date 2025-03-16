import { get } from 'svelte/store'
import { tasksCache } from '/src/store'
import { doc, collection, writeBatch, getDocs } from 'firebase/firestore'
import { db } from '/src/back-end/firestoreConnection'

/**
 * Correctness
 *   createTaskNode:
 *     - Todo: 
 *         - task: treeISOs = []
 *         - sub-task: copy parent's treeISOs
 *     - Calendar:
 *         - task: treeISOs = [startDateISO]
 *         - sub-task: copy parent's treeISOs
 *   Update:
 *     - Reschedule: delete, old new date. Apply to every tree node
 *     - Reparent: figure 
 *   Delete:
 *     - Delete the dateISO for every tree node
 */
export async function updateTreeISOsForEntireTree (uid, task, oldDate, newDate, batch) {
  console.log('workflow 1')
  const ancestors = getAncestorChain(task) // includes the task itself
  console.log('ancestors =', ancestors)
  
  for (const ancestor of ancestors) {
    const ancestorRef = doc(db, 'users', uid, 'tasks', ancestor.id)
    const currentTreeISOs = ancestor.treeISOs || []
    
    // Remove just one instance of the old date
    const updatedTreeISOs = oldDate ? 
      removeOneInstance(currentTreeISOs, oldDate) : 
      [...currentTreeISOs]
    
    if (newDate) updatedTreeISOs.push(newDate)
    
    console.log('update ancestor', ancestor.name, updatedTreeISOs)

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

export async function handleReparentingTreeISOs (uid, task, oldParentID, newParentID, batch) {
  console.log("workflow 2")
  const taskDate = task.startDateISO
  if (!taskDate) return // No date to update
  
  const descendants = getDescendantTasks(task.id) // descendants includes task itself
  const descendantDates = [...new Set(
    descendants.filter(t => t.startDateISO).map(t => t.startDateISO)
  )]
  
  // Update old parent chain - remove all descendant dates
  if (oldParentID) {
    const oldParent = get(tasksCache)[oldParentID]
    const oldAncestors = getAncestorChain(oldParent)
    updateAncestorsRemoveDates(uid, oldAncestors, descendantDates, batch)
  }
  
  // Update new parent chain - add all descendant dates
  if (newParentID) {
    const newParent = get(tasksCache)[newParentID]
    const newAncestors = getAncestorChain(newParent)
    updateAncestorsAddDates(uid, newAncestors, descendantDates, batch)
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

async function updateAncestorsRemoveDates (uid, ancestors, datesToRemove, batch) {
  for (const ancestor of ancestors) {
    const ancestorRef = doc(db, 'users', uid, 'tasks', ancestor.id)
    const currentTreeISOs = ancestor.treeISOs || []
    
    // Remove exactly one instance of each date in datesToRemove
    const updatedTreeISOs = [...currentTreeISOs]
    for (const dateToRemove of datesToRemove) {
      const index = updatedTreeISOs.indexOf(dateToRemove)
      if (index !== -1) updatedTreeISOs.splice(index, 1)
    }
    
    batch.update(ancestorRef, { treeISOs: updatedTreeISOs })
  }
}

async function updateAncestorsAddDates (uid, ancestors, datesToAdd, batch) {  
  for (const ancestor of ancestors) {
    const ancestorRef = doc(db, 'users', uid, 'tasks', ancestor.id)
    const currentTreeISOs = ancestor.treeISOs || []
    const updatedTreeISOs = [...currentTreeISOs, ...datesToAdd]

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

function removeOneInstance(array, item) {
  const index = array.indexOf(item)
  if (index === -1) return [...array]
  return [...array.slice(0, index), ...array.slice(index + 1)]
}