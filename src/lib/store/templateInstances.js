import { user } from './userStore.js'
import { updateCache } from '$lib/store'
import { getFirestoreCollection } from '$lib/db/helpers.js'
import Task from '$lib/db/models/Task.js'
import Template from '$lib/db/models/Template/index.js'
import { RRule } from 'rrule'
import { DateTime } from 'luxon'
import { db } from '$lib/db/init.js'
import { query, collection, where, getDocs } from 'firebase/firestore'

user.subscribe(async ($user) => {
  if ($user.uid) {
    const templates = await getFirestoreCollection('/users/' + $user.uid + '/templates')
    for (const template of templates) {
      let prevEndISO = template.prevEndISO ? template.prevEndISO : DateTime.now().toFormat('yyyy-MM-dd')
      fillTaskInstances({ 
        template, 
        startISO: prevEndISO, 
        uid: $user.uid 
      })
    }
  }
})

export function getOccurrences ({ template, startISO, uid }) {
  if (!template.rrStr) return []
  
  let { rrStr, previewSpan } = template
  if (!previewSpan) previewSpan = 2*7
  
  const start = new Date(startISO)
  const end = DateTime.now().plus({ days: previewSpan }).toJSDate()
  const occurences = RRule.fromString(rrStr).between(
    start,
    end,
    false // excludes start date
  )
  // console.log('start, end, occurences =', start, end, occurences)
  return occurences
}

export function fillTaskInstances ({ template, startISO, uid }) {
  for (const occurence of getOccurrences({ template, startISO, uid })) {
    const startDateISO = DateTime.fromJSDate(occurence).toFormat('yyyy-MM-dd')
    const newTaskObj = Task.schema.parse(template)
    newTaskObj.templateID = template.id
    newTaskObj.startDateISO = startDateISO // note: startDateISO gets overidden if merged with the spread operator with template properties
    Task.create({
      id: template.id + '_' + occurence.toISOString(), // be clear about format, 
      newTaskObj
    })
  }

  Template.update({ userID: uid, id: template.id, updates: {
    prevEndISO: DateTime.now().plus({ days: template.previewSpan }).toFormat('yyyy-MM-dd')
  }})
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
