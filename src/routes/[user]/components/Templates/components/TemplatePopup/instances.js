import Task from '$lib/db/models/Task.js'
import { DateTime } from 'luxon'
import { db } from '$lib/db/init.js'
import { getFirestoreCollection } from '$lib/db/helpers.js'
import { nodesByParent } from '$lib/db/tree.ts'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { user } from '$lib/store'
import { get } from 'svelte/store'
import { updateCache } from '$lib/store/tasksCache.js'
import { getRandomID } from '$lib/utils/core.js'

// flawed, should also handle changed dates that falls outside of the original schedule
// for example, if it routine repeats MWF, but the task is scheduled for Thursday, it was modified
export function isException (task, template) {
  if (!task || !template) return false
  
  for (const k of Object.keys(task)) {
    if (['notes', 'imageDownloadURL', 'iconURL'].includes(k)) {      
      if (task[k] !== template[k]) { 
        return true
      }
    }
  }
  return false
}

// idempotence implicitly requires `startDateISO`
export async function getTemplateTree ({ template, modifiers, idempotent = false }) {
  const templates = await getFirestoreCollection(`/users/${get(user).uid}/templates`)
  const family = templates.filter(T => T.rootID === template.id)
  const root = family.find(T => T.id === template.id)
  const lookup = nodesByParent(family)

  async function instantiate (node, rootID, modifiers = {}) {  
    const newID = node.parentID ? getRandomID() : rootID
    
    /* treeISOs will be handled automatically as long as
    parents are created before children and cache is updated */
    const validatedTask = await Task.create({
      id: newID,
      data: { 
        ...node,
        ...modifiers,
        rootID,
        isArchived: !node.parentID,
        templateID: (!node.parentID && typeof node.rrStr === 'string') ? node.id : '' // quickfix, careful about legacy routines with no `rrStr` corrupting routine logic
      },
      optimistic: false
    })
    updateCache([validatedTask])
  
    for (const child of lookup[node.id]) {
      child.parentID = newID
      instantiate(child, rootID, {})
    }
    return validatedTask
  }

  return instantiate(root, getRandomID(), modifiers)
}

export async function createTaskInstance ({ template, dt }) {
  return Task.create({
    // ensure idempotence, with deterministic IDs
    // assumes the recurrence is at the resolution of days
    id: template.id + '_' + dt.toFormat('yyyy-MM-dd'),
    data: instantiateTask({ template, dt }),
    optimistic: false
  })
}

export function instantiateTask ({ template, dt }) {
  const newTaskObj = Task.schema.parse(template)
  newTaskObj.templateID = template.id
  newTaskObj.startDateISO = dt.toFormat('yyyy-MM-dd')
  newTaskObj.persistsOnList = false
  newTaskObj.parentID = '' // quickfix: force no parentID, ensure no parentID from corrupted template
  return newTaskObj
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