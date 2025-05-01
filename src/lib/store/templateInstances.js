import { user } from './userStore.js'
import { updateCache } from '$lib/store'
import { getFirestoreCollection, updateFirestoreDoc } from '$lib/db/helpers.js'
import Task from '$lib/db/models/Task.js'
import Template from '$lib/db/models/Template.js'
import { DateTime } from 'luxon'
import { db } from '$lib/db/init.js'
import { query, collection, where, getDocs } from 'firebase/firestore'
import { getPreviewSpan } from '/src/routes/[user]/components/Templates/components/TemplatePopup/store.js'

// get around the CommonJS vs ES Module issue
import * as rrule from 'rrule'
const { RRule } = rrule

user.subscribe(async ($user) => {
  if ($user.uid) {
    if ($user.lastRanRoutines !== DateTime.now().toFormat('yyyy-MM-dd')) {
      console.log("auto-generating routines")
      
      const templates = await getFirestoreCollection('/users/' + $user.uid + '/templates')
      for (const template of templates) {
        fillTaskInstances({ 
          template, 
          startISO: template.prevEndISO || DateTime.now().toFormat('yyyy-MM-dd'),
          uid: $user.uid 
        })
      }
      // not safe as it doesn't await, but good enough for now.
      updateFirestoreDoc(`/users/${$user.uid}`, { 
        lastRanRoutines: DateTime.now().toFormat('yyyy-MM-dd') 
      })
    }
  }
})

export function fillTaskInstances ({ template, startISO }) {
  for (const occurence of generateDates({ rrStr: template.rrStr, startISO, previewSpan: template.previewSpan  })) {
    createTaskInstance({ template, occurence }) // note the single `r` in occurence
  }

  Template.update({ id: template.id, updates: {
    prevEndISO: DateTime.now().plus({ days: template.previewSpan }).toFormat('yyyy-MM-dd')
  }})
}

export function generateDates ({ rrStr, startISO, previewSpan }) {
  if (!rrStr) return []
  
  if (!previewSpan) previewSpan = getPreviewSpan(rrStr)
  console.log("rrStr =", rrStr)
  console.log('new Date(startISO) =', new Date(startISO))
  console.log('previewSpan =', previewSpan)

  return RRule.fromString(rrStr).between(
    new Date(startISO),
    DateTime.now().plus({ days: previewSpan }).toJSDate(),
    false // excludes start date
  )
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