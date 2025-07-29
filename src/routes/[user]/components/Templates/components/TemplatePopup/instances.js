import Task from '$lib/db/models/Task.js'
import { DateTime } from 'luxon'
import { db } from '$lib/db/init.js'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { user } from '$lib/store'
import { get } from 'svelte/store'

// flawed, should also handle changed dates that falls outside of the original schedule
// for example, if it routine repeats MWF, but the task is scheduled for Thursday, it was modified
export function isException (task, template) {
  if (!task || !template) {
    console.log("isException received null/undefined task or template", {task, template})
    return false
  }
  
  for (const k of Object.keys(task)) {
    if (['notes', 'imageDownloadURL', 'iconURL'].includes(k)) {      
      if (task[k] !== template[k]) { 
        console.log("Exception found =", task.id, k, task[k], template[k])
        return true
      }
    }
  }
  return false
}

export function createTaskInstance ({ template, occurrence }) {
  Task.create({
    // ensure idempotence, with deterministic IDs
    // assumes the recurrence is at the resolution of days
    id: template.id + '_' + DateTime.fromJSDate(occurrence).toFormat('yyyy-MM-dd'),
    newTaskObj: instantiateTask({ template, occurrence })
  })
}

export function instantiateTask ({ template, occurrence }) {
  const newTaskObj = Task.schema.parse(template)
  newTaskObj.templateID = template.id
  newTaskObj.startDateISO = DateTime.fromJSDate(occurrence).toFormat('yyyy-MM-dd')
  newTaskObj.persistsOnList = false
  return newTaskObj
}

export async function getAffectedInstances (template) {
  const tasksQuery = query(
    collection(db, 'users', get(user).uid, 'tasks'),
    where('templateID', '==', template.id),
    where('startDateISO', '>=', DateTime.now().toFormat('yyyy-MM-dd'))
  )
  const tasksSnapshot = await getDocs(tasksQuery)
  return tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}))
}

export async function deleteFutureInstances (template, uid) {
  return new Promise(async (resolve) => {
    const tasksQuery = query(
      collection(db, 'users', uid, 'tasks'),
      where('templateID', '==', template.id),
      where('startDateISO', '>=', DateTime.now().toFormat('yyyy-MM-dd'))
    )
    const tasksSnapshot = await getDocs(tasksQuery)
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    updateCache(tasks)

    const promises = []
    for (const task of tasks) {
      promises.push(
        Task.delete({ id: task.id })
      )
    }
    await Promise.all(promises)
    resolve()
  })
}