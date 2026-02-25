import Task from '$lib/db/models/Task.js'
import { DateTime } from 'luxon'
import { db } from '$lib/db/init.js'
import { getFirestoreCollection } from '$lib/db/helpers.js'
import { nodesByParent } from '$lib/db/tree.ts'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { user } from '$lib/store'
import { get } from 'svelte/store'
import { updateCache, tasksCache } from '$lib/store/tasksCache.js'
import { getRandomID } from '$lib/utils/core.js'

// only top-level tasks can be templates i.e. parentID === ''
export async function getTemplateTree ({ template, modifiers = {}, idempotentISO = '' }) {
  const templates = await getFirestoreCollection(`/users/${get(user).uid}/templates`)
  const family = templates.filter(T => T.rootID === template.rootID)
  const lookup = nodesByParent(family)

  async function instantiate (node, rootID, modifiers = {}) {  
    const id = idempotentISO ? `${node.id}_${idempotentISO}` : getRandomID() // ideally we want only the root node to receive this, but this is harmless for now
    if (rootID === '') rootID = id
    
    /* treeISOs will be maintained by Task.create() as long as parents are created before children (with `tasksCache` updated) */
    const validatedTask = await Task.create({ id, optimistic: false,
      data: { 
        ...node,
        ...modifiers,
        rootID,
        isArchived: rootID === id,
        templateID: (!node.parentID && typeof node.rrStr === 'string') ? node.id : '' // quickfix, careful about legacy routines with no `rrStr` corrupting routine logic
      }
    })
    updateCache([validatedTask])
  
    for (const child of lookup[node.id]) {
      child.parentID = id
      instantiate(child, rootID, {})
    }
    return validatedTask
  }

  if (modifiers.parentID) {
    const parent = get(tasksCache)[modifiers.parentID]
    return instantiate(template, parent.rootID, modifiers)
  } else {
    return instantiate(template, '', modifiers)
  }
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