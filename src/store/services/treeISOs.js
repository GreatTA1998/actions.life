import { get } from 'svelte/store'
import { tasksCache } from '/src/store'
import { doc, collection, writeBatch, getDocs } from 'firebase/firestore'
import { db } from '/src/back-end/firestoreConnection'
import { user } from '/src/store'

export function maintainTreeISOsForCreate ({ task, batch }) {
  if (task.parentID) {
    const parent = get(tasksCache)[task.parentID]

    if (task.startDateISO) {
      return batchUpdate({ 
        nodes: listTreeNodes(getRoot(parent)), 
        treeISOs: [...parent.treeISOs, task.startDateISO],
        batch 
      })
    }
    else {
      return [...parent.treeISOs]
    }
  }

  else {
    return task.startDateISO ? [task.startDateISO] : []
  }
}

export function maintainTreeISOs ({ id, keyValueChanges, batch }) {
  const task = get(tasksCache)[id]
  const changes = keyValueChanges
  
  if (hasChangedFamily({ task, changes })) {
    handleCrossTree({ task, changes, batch })
  }
  else if (changes.startDateISO !== task.startDateISO) {
    handleSameTree({ task, changes, batch })
  }
}

function hasChangedFamily ({ task, changes }) {
  const { parentID } = changes
  const parentChanged = (parentID !== undefined && parentID !== task.parentID) 
  const rootChanged = getRoot(get(tasksCache)[parentID]) !== getRoot(task)

  return parentChanged && rootChanged
}

export function handleCrossTree ({ task, changes, batch }) {
  console.log('handleCrossTree', task, changes)
  const movedTree = listTreeNodes(task)
  
  // prev family
  const prevFamily = listTreeNodes(getRoot(task))
  let prevFamilyISOs = [...task.treeISOs]
  for (const node of movedTree) {
    if (node.startDateISO) prevFamilyISOs = removeOneInstance(prevFamilyISOs, node.startDateISO)
  }
  batchUpdate({ nodes: prevFamily, treeISOs: prevFamilyISOs, batch })

  // new family
  const newParent = get(tasksCache)[changes.parentID]
  const newFamily = listTreeNodes(getRoot(newParent))
  let newFamilyISOs = newParent ? [...newParent.treeISOs] : []
  for (const node of movedTree) {
    if (node.startDateISO) newFamilyISOs.push(node.startDateISO)
  }
  newFamilyISOs = correctTreeISOs({ 
    prevDate: task.startDateISO, 
    newDate: changes.startDateISO, 
    array: newFamilyISOs 
  })
  batchUpdate({ nodes: newFamily, treeISOs: newFamilyISOs, batch })
  batchUpdate({ nodes: movedTree, treeISOs: newFamilyISOs, batch })
}

export async function handleSameTree ({ task, changes, batch }) {
  return batchUpdate({ 
    nodes: listTreeNodes(getRoot(task)),
    treeISOs: correctTreeISOs({ 
      prevDate: task.startDateISO, 
      newDate: changes.startDateISO, 
      array: [...task.treeISOs] 
    }),
    batch 
  })
}

function correctTreeISOs ({ prevDate, newDate, array }) {
  if (prevDate !== newDate) {
    if (prevDate) array = removeOneInstance(array, prevDate)  
    if (newDate) array.push(newDate)
  }
  return array
}

function batchUpdate ({ nodes, treeISOs, batch }) {
  for (const node of nodes) {
    const ref = doc(db, `/users/${get(user).uid}/tasks/${node.id}`)
    batch.update(ref, { 
      treeISOs
    })
    console.log('updated', node.name, treeISOs)
  }
  return treeISOs
}

export function getRoot (task) {
  if (task === undefined) return undefined

  let current = task
  while (current.parentID) {
    const parent = get(tasksCache)[current.parentID]
    if (!parent) break
    current = parent
  }
  return current
}

// rewrite using caches in the future
export function listTreeNodes (task) {
  if (task === undefined) return []

  const nodes = []
  const queue = [task.id]
  
  while (queue.length > 0) {
    const currentID = queue.shift()
    const task = get(tasksCache)[currentID]
    
    if (task) {
      nodes.push(task)
      
      const children = Object.values(get(tasksCache))
        .filter(t => t.parentID === currentID)
      
      queue.push(...children.map(child => child.id))
    }
  }
  return nodes
}

export function removeOneInstance(array, item) {
  const index = array.indexOf(item)
  if (index === -1) return [...array]
  return [...array.slice(0, index), ...array.slice(index + 1)]
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