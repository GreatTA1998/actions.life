import { get } from 'svelte/store'
import { tasksCache } from '/src/lib/store'
import { doc, collection, writeBatch, getDocs, query, where, getDoc } from 'firebase/firestore'
import { db } from '/src/lib/db/init'
import { user } from '/src/lib/store'
import { getFirestoreDoc } from '/src/lib/db/helpers.js'

export async function maintainTreeISOsForCreate ({ task, batch }) {
  return new Promise(async (resolve) => {
    if (task.parentID) {
      const parent = get(tasksCache)[task.parentID]
  
      if (task.startDateISO) {
        const root = await getRoot(parent)
        const nodes = await getTreeNodes(root)
        const result = batchUpdate({ 
          nodes, 
          rootID: root.id,
          treeISOs: [...parent.treeISOs, task.startDateISO],
          batch 
        })
        resolve(result)
      }
      else {
        resolve([...parent.treeISOs])
      }
    }
  
    else {
      resolve(task.startDateISO ? [task.startDateISO] : [])
    }
  })
}

export async function maintainTreeISOs ({ id, batch, keyValueChanges: changes }) {
  return new Promise(async (resolve) => {
    const task = get(tasksCache)[id]
    const crossFamily = await hasChangedFamily({ task, changes })
    if (crossFamily) {
      await handleCrossTree({ task, changes, batch })
    }
    else if (changes.startDateISO !== undefined && changes.startDateISO !== task.startDateISO) {
      await handleSameTree({ task, changes, batch })
    }
    resolve()
  })
}

function hasChangedFamily ({ task, changes }) {
  return new Promise(async (resolve) => {
    const { parentID } = changes
    const parentChanged = (parentID !== undefined && parentID !== task.parentID)
    
    let rootChanged = false
    if (parentChanged) {
      const oldRoot = await getRoot(task)
      const newRoot = await getRoot(get(tasksCache)[parentID])
      rootChanged = oldRoot !== newRoot
    }
    
    resolve(parentChanged && rootChanged)
  })
}

export async function handleCrossTree ({ task, changes, batch }) {
  return new Promise(async (resolve) => {
    console.log('handleCrossTree', task, changes)  
  
    let prevFamily, movedTree, newFamily
    const newParent = get(tasksCache)[changes.parentID]
    
    // Get all tree nodes in parallel
    await Promise.all([
      getTreeNodes(task).then(nodes => movedTree = nodes),
      getRoot(task).then(root => getTreeNodes(root).then(nodes => prevFamily = nodes)),
      getRoot(newParent).then(root => getTreeNodes(root).then(nodes => newFamily = nodes))
    ])
    console.log('resolved parallel =', prevFamily, movedTree, newFamily)
    
    // prev family
    console.log('familyISOs before =', task.treeISOs)
    let prevFamilyISOs = [...task.treeISOs]
    for (const node of movedTree) {
      if (node.startDateISO) {
        prevFamilyISOs = removeOneInstance(prevFamilyISOs, node.startDateISO)
      } 
    }
    console.log('familyISOs after =', prevFamilyISOs)

    batchUpdate({ nodes: prevFamily, treeISOs: prevFamilyISOs, batch })
  
    // new family
    let newFamilyISOs = newParent ? [...newParent.treeISOs] : []
    const rootTask = await getRoot(newParent)
    let newFamilyRootID = rootTask ? rootTask.id : task.id

    for (const node of movedTree) {
      if (node.startDateISO) {
        console.log('pushing to new family', node.startDateISO)
        newFamilyISOs.push(node.startDateISO)
      } 
    }
    console.log('after pushing =', newFamilyISOs)

    if (task.startDateISO !== changes.startDateISO) {
      newFamilyISOs = correctTreeISOs({ 
        prevDate: task.startDateISO, 
        newDate: changes.startDateISO, 
        array: newFamilyISOs 
      })
      console.log('after correcting =', newFamilyISOs)
    }


    // no need to change `rootID`
    batchUpdate({ nodes: newFamily, treeISOs: newFamilyISOs, batch })

    // need to change `rootID` for the small tree to the new parent
    batchUpdate({ 
      nodes: movedTree, 
      treeISOs: newFamilyISOs, 
      rootID: newFamilyRootID,
      batch
    })

    console.log('resolving cross tree')
    resolve()
  })
}

export async function handleSameTree ({ task, changes, batch }) {
  return new Promise(async (resolve) => {
    if (!task.treeISOs) alert('This task has no treeISOs so operations will fail!')
    console.log('handleSameTree', task, changes)
    const root = await getRoot(task)
    const treeNodes = await getTreeNodes(root)
    const result = batchUpdate({ 
      nodes: treeNodes,
      treeISOs: correctTreeISOs({ 
        prevDate: task.startDateISO, 
        newDate: changes.startDateISO,  
        array: [...task.treeISOs] 
      }),
      batch 
    }) 
    resolve(result)
  })
}

function correctTreeISOs ({ prevDate, newDate, array }) {
  if (prevDate) array = removeOneInstance(array, prevDate)  
  if (newDate) array.push(newDate)
  return array
}

function batchUpdate ({ nodes, treeISOs, batch, rootID }) {
  const updateObj = { treeISOs }
  if (rootID !== undefined) updateObj.rootID = rootID
  for (const node of nodes) {
    const ref = doc(db, `/users/${get(user).uid}/tasks/${node.id}`)
    batch.update(ref, updateObj)
  }
  return { treeISOs, rootID }
}

export function getRoot (task) {
  return new Promise(async (resolve) => {
    if (task === undefined) {
      resolve(undefined)
      return
    }

    const cacheResult = get(tasksCache)[task.rootID]
    if (cacheResult) resolve(cacheResult)
    else {
      const rootDoc = await getFirestoreDoc(`/users/${get(user).uid}/tasks/${task.rootID}`)
      get(tasksCache)[rootDoc.id] = rootDoc
      resolve(rootDoc)
    }
  })
}

export async function getTreeNodes (task) {
  return new Promise(async (resolve) => {
    if (task === undefined) {
      resolve([])
      return
    }
    const tasksSnapshot = await getDocs(
      query(
        collection(db, `/users/${get(user).uid}/tasks`),
        where('rootID', '==', task.rootID)
      )
    )
    const nodes = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    for (const node of nodes) {
      get(tasksCache)[node.id] = node
    }

    const result = [task]
    helper(task, result)
    
    function helper (current, result) {
      const children = nodes.filter(node => node.parentID === current.id)
      result.push(...children)
      for (const child of children) {
        helper(child, result)
      }
    }
    resolve(result)
  })
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

export async function handleTreeISOsForDeletion({ tasksToDelete, batch }) {
  // Handle tree ISOs when deleting tasks
  if (!tasksToDelete || !tasksToDelete.length) return
  
  const tasksByRoot = {}
  
  // Group tasks by their root
  for (const task of tasksToDelete) {
    if (!task.treeISOs || !task.treeISOs.length) continue
    
    const rootTask = await getRoot(task)
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
    const allTreeNodes = await getTreeNodes(root)
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

/**
 * Migrates existing tasks to use the rootID field
 * This function should be manually called from the console
 * 
 * Usage:
 * migrateToRootID('user123', true) // Dry run
 * migrateToRootID('user123') // Actual migration
 * 
 * @param {string} uid - User ID to migrate
 * @param {boolean} dryRun - If true, only simulates the migration without writing
 * @returns {Promise<Object>} Migration results
 */
export async function migrateToRootID(uid, dryRun = false) {
  try {
    console.log(`${dryRun ? 'SIMULATION' : 'STARTING'} migration to rootID for user ${uid}`)
    
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
      const result = await processTreeForRootIDMigration(
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
    console.error(`ERROR during ${dryRun ? 'dry run' : 'migration'} to rootID:`, error)
    return { 
      success: false, 
      message: `Error during migration: ${error.message}`,
      error
    }
  }
}

/**
 * Helper function for migrateToRootID
 * Processes a tree for migration, setting rootID for all nodes
 */
async function processTreeForRootIDMigration(rootTask, taskMap, uid, batch, dryRun, onTaskProcessed) {
  // Set rootID for all nodes in this tree
  const queue = [rootTask]
  const treeNodes = []
  
  while (queue.length > 0) {
    const current = queue.shift()
    treeNodes.push(current)
    
    // Add children to queue
    if (current.children) {
      queue.push(...current.children)
    }
  }
  
  // For each node in the tree, update its rootID field
  for (const node of treeNodes) {
    if (!dryRun) {
      const docRef = doc(db, `users/${uid}/tasks/${node.id}`)
      
      // Only update if the node doesn't already have rootID or if it's different
      if (!node.rootID || node.rootID !== rootTask.id) {
        batch.update(docRef, { rootID: rootTask.id })
        onTaskProcessed()
      }
    } else {
      // In dry run, just count tasks that would be updated
      if (!node.rootID || node.rootID !== rootTask.id) {
        onTaskProcessed()
      }
    }
  }
  
  return { rootId: rootTask.id, nodesCount: treeNodes.length }
}