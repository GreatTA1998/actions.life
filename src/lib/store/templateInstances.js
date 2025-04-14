import { user } from './userStore.js'
import { getFirestoreCollection } from '$lib/db/helpers.js'
import Task from '$lib/db/models/Task.js'
import Template from '$lib/db/models/Template/index.js'
import { RRule } from 'rrule'
import { DateTime } from 'luxon'

user.subscribe(async ($user) => {
  if ($user.uid) {
    console.log('handling templates')
    const templates = await getFirestoreCollection('/users/' + $user.uid + '/templates')
    for (const template of templates) {
      fillTaskInstances(template, $user.uid)
    }
  }
})

function fillTaskInstances (template, uid) {
  if (!template.rrStr) return
  
  let { lastTaskISO, rrStr, previewSpan } = template
  if (!lastTaskISO) lastTaskISO = DateTime.now().toFormat('yyyy-MM-dd')
  if (!previewSpan) previewSpan = 2*7
  
  const start = new Date(lastTaskISO)
  const end = DateTime.now().plus({ days: previewSpan }).toJSDate()
  console.log('start =', start)
  console.log('end =', end)
  console.log('rrStr =', rrStr)
  const occurences = RRule.fromString(rrStr).between(
    start,
    end,
    false // excludes start date
  )

  for (const occurence of occurences) {
    const newTaskObj = Task.schema.parse(template)
    newTaskObj.templateID = template.id
    newTaskObj.startDateISO = DateTime.fromJSDate(occurence).toFormat('yyyy-MM-dd') // note: startDateISO gets overidden if merged with the spread operator with template properties
    Task.create({
      id: template.id + '_' + occurence.toISOString(), // be clear about format, 
      newTaskObj
    })
  }

  Template.update({ userID: uid, id: template.id, updates: {
    lastTaskISO: DateTime.fromJSDate(end).toFormat('yyyy-MM-dd')
  }})

  console.log("occurences =", occurences)
  console.log('lastTaskISO =', DateTime.fromJSDate(end).toFormat('yyyy-MM-dd'))
}
