import { tasksCache, user } from '$lib/store'
import { get } from 'svelte/store'
import { db } from '$lib/db/init'
import { getFirestoreDoc } from '$lib/db/helpers.js'
import { doc, collection, getDocs, query, where } from 'firebase/firestore'

export async function maintainTreeISOsForCreate ({ task, batch }) {
  if (task.parentID) {
    const parent = get(tasksCache)[task.parentID]

    if (task.startDateISO) {
      const root = await getRoot(parent)
      const nodes = await getSubtreeNodes(root)
      const result = batchUpdate({ 
        nodes, 
        rootID: root.id,
        treeISOs: [...parent.treeISOs, task.startDateISO],
        batch
      })
      return result
    }
    else {
      return [...parent.treeISOs]
    }
  }

  else {
    return task.startDateISO ? [task.startDateISO] : []
  }
}

export async function maintainTreeISOs ({ id, batch, keyValueChanges: changes }) {
  const task = get(tasksCache)[id]
  const crossFamily = await hasChangedFamily({ task, changes })
  if (crossFamily) {
    await handleCrossTree({ task, changes, batch })
  }
  else if (changes.startDateISO !== undefined && changes.startDateISO !== task.startDateISO) {
    await handleSameTree({ task, changes, batch })
  }
}

async function hasChangedFamily ({ task, changes }) {
  const { parentID } = changes
  const parentChanged = (parentID !== undefined && parentID !== task.parentID)
  
  let rootChanged = false
  if (parentChanged) {
    const [oldRoot, newRoot] = await Promise.all([
      getRoot(task),
      getRoot(get(tasksCache)[parentID])
    ])
    rootChanged = oldRoot !== newRoot
  }
  
  return parentChanged && rootChanged
}

export async function handleCrossTree ({ task, changes, batch }) {
  let movedTree = [] // 1 or more nodes
  let prevFamily = [] // 1 or more nodes
  let newFamily = [] // 0 or more nodes
  const newParent = get(tasksCache)[changes.parentID]
  
  await Promise.all([
    getSubtreeNodes(task).then(nodes => movedTree = nodes),
    getRoot(task).then(getSubtreeNodes).then(nodes => prevFamily = nodes),
    getRoot(newParent).then(getSubtreeNodes).then(nodes => newFamily = nodes)
  ])
  
  let prevFamilyISOs = [...task.treeISOs]
  for (const node of movedTree) {
    if (node.startDateISO) {
      prevFamilyISOs = removeOneInstance(prevFamilyISOs, node.startDateISO)
    } 
  }
  batchUpdate({ nodes: prevFamily, treeISOs: prevFamilyISOs, batch })
  
  let newFamilyISOs = newParent ? [...newParent.treeISOs] : [] // moved node will start its own family
  for (const node of movedTree) { // edge case: node's startDateISO can simultaneously change during this drag-drop
    if (node.id === task.id) { // `movedTree` contains the outdated task `startDateISO`, so update it with the new changes
      if (changes.startDateISO) node.startDateISO = changes.startDateISO
    }
  }
  for (const node of movedTree) {
    if (node.startDateISO) newFamilyISOs.push(node.startDateISO)
  } 
  batchUpdate({ 
    nodes: [...movedTree, ...newFamily], 
    rootID: newFamily[0] ? newFamily[0].rootID : task.id, // moved node will start its own family
    treeISOs: newFamilyISOs,
    batch 
  })
}

export async function handleSameTree ({ task, changes, batch }) {
  if (!task.treeISOs) alert('This task has no treeISOs so operations will fail!')
  const root = await getRoot(task)
  const treeNodes = await getSubtreeNodes(root)
  const result = batchUpdate({ 
    nodes: treeNodes,
    treeISOs: correctTreeISOs({ 
      prevDate: task.startDateISO, 
      newDate: changes.startDateISO,  
      array: [...task.treeISOs] 
    }),
    batch 
  }) 
  return result
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

export async function getRoot (task) {
  if (task === undefined) return undefined

  const cacheResult = get(tasksCache)[task.rootID]
  if (cacheResult) return cacheResult
  else {
    const rootDoc = await getFirestoreDoc(`/users/${get(user).uid}/tasks/${task.rootID}`)
    get(tasksCache)[rootDoc.id] = rootDoc
    
    return rootDoc
  }
}

export async function getSubtreeNodes (task) {
  if (task === undefined) return []

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
  return result
}

export function removeOneInstance(array, item) {
  const index = array.indexOf(item)
  if (index === -1) return [...array]
  return [...array.slice(0, index), ...array.slice(index + 1)]
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
    const allTreeNodes = await getSubtreeNodes(root)
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