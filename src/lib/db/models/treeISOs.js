import { get } from 'svelte/store'
import { tasksCache } from '/src/lib/store'
import { doc, collection, writeBatch, getDocs } from 'firebase/firestore'
import { db } from '/src/lib/db/init'
import { user } from '/src/lib/store'

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
  console.log('maintainTreeISOs', task, changes)
  
  if (hasChangedFamily({ task, changes })) {
    handleCrossTree({ task, changes, batch })
  }
  else if (changes.startDateISO !== undefined && changes.startDateISO !== task.startDateISO) {
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
  if (!task.treeISOs) alert('This task has no treeISOs so operations will fail!')
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
  if (!task.treeISOs) alert('This task has no treeISOs so operations will fail!')
  console.log('handleSameTree', task, changes)
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

// rewrite using unified app-level caches in the future
export function listTreeNodes (task) {
  if (task === undefined) return []

  // Get tasksCache once (ideally we already have a cache, but right now it's hard to unify the todo & cal structures)
  const allTasks = get(tasksCache)
  
  // Build temporary parent->children map
  const parentToChildren = {}
  for (const [id, t] of Object.entries(allTasks)) {
    if (t.parentID) {
      if (!parentToChildren[t.parentID]) parentToChildren[t.parentID] = []
      parentToChildren[t.parentID].push(t)
    }
  }
  
  // BFS traversal using the map
  const nodes = []
  const queue = [task]
  
  while (queue.length > 0) {
    const currentTask = queue.shift()
    
    if (currentTask) {
      nodes.push(currentTask)
      
      // Use map for direct child lookup
      const children = parentToChildren[currentTask.id] || []
      queue.push(...children)
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
      message: `Error during migration: ${error.message}`,
      error
    }
  }
}

/**
 * Helper function for migrateToTreeISOs
 * Processes a tree for migration, calculating and updating treeISOs for all nodes
 */
async function processTreeForMigration(rootTask, taskMap, uid, batch, dryRun, onTaskProcessed) {
  // Find all dates in this tree
  const treeISOs = []
  
  // Collect all tasks in this tree with BFS
  const queue = [rootTask]
  const treeNodes = []
  
  while (queue.length > 0) {
    const current = queue.shift()
    treeNodes.push(current)
    
    // Add startDateISO if present
    if (current.startDateISO) {
      treeISOs.push(current.startDateISO)
    }
    
    // Add children to queue
    if (current.children) {
      queue.push(...current.children)
    }
  }
  
  // For each node in the tree, update its treeISOs field
  for (const node of treeNodes) {
    if (!dryRun) {
      const docRef = doc(db, `users/${uid}/tasks/${node.id}`)
      
      // Only update if the node doesn't already have treeISOs or if it's different
      if (!node.treeISOs || !arraysEqual(node.treeISOs, treeISOs)) {
        batch.update(docRef, { treeISOs })
        onTaskProcessed()
      }
    } else {
      // In dry run, just count tasks that would be updated
      if (!node.treeISOs || !arraysEqual(node.treeISOs, treeISOs)) {
        onTaskProcessed()
      }
    }
  }
  
  return { rootId: rootTask.id, nodesCount: treeNodes.length, datesCount: treeISOs.length }
}

// Helper function to compare arrays
function arraysEqual(a, b) {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false
  
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  
  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i] !== sortedB[i]) return false
  }
  
  return true
}

export function handleTreeISOsForDeletion({ tasksToDelete, batch }) {
  // Handle tree ISOs when deleting tasks
  if (!tasksToDelete || !tasksToDelete.length) return
  
  const tasksByRoot = {}
  
  // Group tasks by their root
  for (const task of tasksToDelete) {
    if (!task.treeISOs || !task.treeISOs.length) continue
    
    const rootTask = getRoot(task)
    if (!rootTask) continue
    
    const rootId = rootTask.id
    if (!tasksByRoot[rootId]) {
      tasksByRoot[rootId] = { 
        root: rootTask, 
        tasksToRemove: [], 
        datesToRemove: [] 
      }
    }
    
    if (task.startDateISO) {
      tasksByRoot[rootId].datesToRemove.push(task.startDateISO)
    }
    tasksByRoot[rootId].tasksToRemove.push(task)
  }
  
  // Update tree ISOs for each affected root
  for (const rootId in tasksByRoot) {
    const { root, tasksToRemove, datesToRemove } = tasksByRoot[rootId]
    
    if (!root.treeISOs || !root.treeISOs.length) continue
    
    // Calculate the new tree ISOs
    let newTreeISOs = [...root.treeISOs]
    for (const date of datesToRemove) {
      newTreeISOs = removeOneInstance(newTreeISOs, date)
    }
    
    // Get all nodes in the tree that will remain
    const allTreeNodes = listTreeNodes(root)
    const remainingNodes = allTreeNodes.filter(node => 
      !tasksToRemove.some(task => task.id === node.id)
    )
    
    // Update all remaining nodes with the new tree ISOs
    for (const node of remainingNodes) {
      const ref = doc(db, `/users/${get(user).uid}/tasks/${node.id}`)
      batch.update(ref, { treeISOs: newTreeISOs })
    }
  }
} 