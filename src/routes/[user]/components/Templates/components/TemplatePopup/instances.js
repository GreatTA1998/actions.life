import Task from '$lib/db/models/Task.js'
import { DateTime } from 'luxon'
import { db } from '$lib/db/init.js'
import { getFirestoreCollection } from '$lib/db/helpers.js'
import { nodesByParent } from '$lib/db/tree.ts'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { user } from '$lib/store'
import { get } from 'svelte/store'
import { updateCache, tasksCache } from '$lib/store/tasksCache.js'
import { randomID } from '$lib/utils/core.js'

// only top-level tasks can be templates i.e. parentID === ''
export async function instantiateTree ({ template, modifiers = {}, idempotentISO = '' }) {
  const allTemplates = await getFirestoreCollection(`/users/${get(user).uid}/templates`)
  const newTreeID = idempotentISO ? `${template.id}_${idempotentISO}` : randomID()
  const { parentID } = modifiers

  return helper({ 
    node: { ...template, ...modifiers }, 
    parentID: parentID ? parentID : '',
    rootID: parentID ? get(tasksCache)[parentID].rootID : newTreeID,
    id: newTreeID,
    templateID: (typeof template.rrStr === 'string') ? template.id : '',
    memo: nodesByParent(allTemplates.filter(T => T.rootID === template.rootID))
  })
}

async function helper ({ node, id, parentID, rootID, templateID, memo }) {
  const result = await Task.create({ id, optimistic: false, data: { 
    ...node, parentID, rootID, templateID
  }}) 
  updateCache([result])

  // treeISOs will be maintained by Task.create() as long as `parent` and `tasksCache` are created before children
  for (const child of memo[node.id]) {
    helper({ 
      node: child, 
      parentID: id,
      rootID,  
      id: randomID(), 
      templateID: '',
      memo
    })
  }
  return result
}

export async function getAffectedInstances (template) {
  const snapshot = await getDocs(
    query(
      collection(db, 'users', get(user).uid, 'tasks'),
      where('templateID', '==', template.id),
      where('startDateISO', '>=', DateTime.now().toFormat('yyyy-MM-dd'))
    )
  )
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}))
}

// is this never used?
export async function deleteFutureInstances (template, uid) {
  const snapshot = await getDocs(
    query(
      collection(db, 'users', uid, 'tasks'),
      where('templateID', '==', template.id),
      where('startDateISO', '>=', DateTime.now().toFormat('yyyy-MM-dd'))
    )
  )
  const instances  = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  updateCache(instances) // Task.delete relies on cache

  return Promise.all(
    instances.map(instance => Task.delete({ id: instance.id }))
  )
}