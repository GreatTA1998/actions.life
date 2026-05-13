import { user } from '$lib/store'
import { get } from 'svelte/store'
import { db } from '$lib/db/init.js'
import { getFirestoreDoc } from '$lib/db/helpers.js'
import { doc, collection, getDocs, query, where } from 'firebase/firestore'

export async function updateEntireTree ({ treeISOs, batch, parent }) {
  const root = await getRoot(parent)
  const nodes = await getSubtreeNodes(root)
  batchUpdate({ nodes, batch, treeISOs })
}

export async function maintainTreeISOs ({ id, batch, kvChanges: changes }) {
  const task = await getFirestoreDoc(`/users/${get(user).uid}/tasks/${id}`)
  const crossFamily = await hasChangedFamily({ task, changes })
  if (crossFamily) {
    await handleCrossTree({ task, changes, batch })
  }
  else if (changes.startDateISO !== undefined && changes.startDateISO !== task.startDateISO) {
    await handleSameTree({ task, changes, batch })
  }
}

async function hasChangedFamily ({ task, changes }) {
  if (changes.parentID === undefined) return false
  else if (changes.parentID === task.parentID) return false
  else {
    const parent = await getFirestoreDoc(`/users/${get(user).uid}/tasks/${changes.parentID}`)
    const [oldRoot, newRoot] = await Promise.all([
      getRoot(task),
      getRoot(parent)
    ])
    return oldRoot.id !== newRoot.id
  }
}

export async function handleCrossTree ({ task, changes, batch }) {
  let movedTree = [] // 1 or more nodes
  let prevFamily = [] // 1 or more nodes
  let newFamily = [] // 0 or more nodes
  const newParent = await getFirestoreDoc(`/users/${get(user).uid}/tasks/${changes.parentID}`)
  
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
  const root = await getRoot(task)
  const treeNodes = await getSubtreeNodes(root)
  batchUpdate({ 
    nodes: treeNodes,
    treeISOs: correctTreeISOs({ 
      prevDate: task.startDateISO, 
      newDate: changes.startDateISO,  
      array: [...task.treeISOs] 
    }),
    batch 
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
}

export async function getRoot (task) {
  if (task === undefined) return undefined

  return getFirestoreDoc(`/users/${get(user).uid}/tasks/${task.rootID}`)
}

export async function getSubtreeNodes (task) {
  if (task === undefined) return []

  const tasksSnapshot = await getDocs(
    query(
      collection(db, `/users/${get(user).uid}/tasks`),
      where('rootID', '==', task.rootID)
    ) // to fail fast, only fetch archived tasks
  )
  const nodes = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  
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

export function removeOneInstance (array, item) {
  const index = array.indexOf(item)
  if (index === -1) return [...array]
  return [...array.slice(0, index), ...array.slice(index + 1)]
}

export async function handleTreeISOsForDeletion ({ tasksToDelete, batch }) {
  if (!tasksToDelete || !tasksToDelete.length) return
  
  const tasksByRoot = {}

  for (const task of tasksToDelete) {
    if (!task.treeISOs.length) continue
    
    const root = await getRoot(task)
    if (!tasksByRoot[root.id]) {
      tasksByRoot[root.id] = { 
        root, 
        tasksToRemove: [], 
        datesToRemove: [] 
      }
    }
    
    if (task.startDateISO) {
      tasksByRoot[root.id].datesToRemove.push(task.startDateISO)
    }
    tasksByRoot[root.id].tasksToRemove.push(task)
  }
  
  for (const rootID in tasksByRoot) {
    const { root, tasksToRemove, datesToRemove } = tasksByRoot[rootID]
    
    if (!root.treeISOs.length) continue
    
    let newTreeISOs = [...root.treeISOs]
    for (const date of datesToRemove) {
      newTreeISOs = removeOneInstance(newTreeISOs, date)
    }
    const allTreeNodes = await getSubtreeNodes(root)
    const remainingNodes = allTreeNodes.filter(node => 
      !tasksToRemove.some(task => task.id === node.id)
    )
    for (const node of remainingNodes) {
      const ref = doc(db, `/users/${get(user).uid}/tasks/${node.id}`)
      batch.update(ref, { treeISOs: newTreeISOs })
    }
  }
}