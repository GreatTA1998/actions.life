import Task from '$lib/db/models/Task.js'
import { DateTime } from 'luxon'

// flawed, should also handle changed dates that falls outside of the original schedule
// for example, if it routine repeats MWF, but the task is scheduled for Thursday, it was modified
export function isException(task, template) {
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

export function fillTaskInstances ({ template, startISO }) {
  for (const occurence of generateDates({ rrStr: template.rrStr, startISO, previewSpan: template.previewSpan  })) {
    createTaskInstance({ template, occurence }) // note the single `r` in occurence
  }

  Template.update({ id: template.id, updates: {
    prevEndISO: DateTime.now().plus({ days: template.previewSpan }).toFormat('yyyy-MM-dd')
  }})
}

export function createTaskInstance ({ template, occurence }) {
  Task.create({
    id: template.id + '_' + occurence.toISOString(), // be clear about format, 
    newTaskObj: instantiateTask({ template, occurence })
  })
}

export function instantiateTask ({ template, occurence }) {
  const newTaskObj = Task.schema.parse(template)
  newTaskObj.templateID = template.id
  newTaskObj.startDateISO = DateTime.fromJSDate(occurence).toFormat('yyyy-MM-dd')
  newTaskObj.persistsOnList = false
  return newTaskObj
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
        Task.delete({ id: task.id, willConfirm: false })
      )
    }
    await Promise.all(promises)
    resolve()
  })
}