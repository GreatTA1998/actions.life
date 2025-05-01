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