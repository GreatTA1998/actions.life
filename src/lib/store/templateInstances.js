import { user } from './userStore.js'
import { getFirestoreCollection } from '$lib/db/helpers.js'
import Task from '$lib/db/models/Task.js'
import { datetime, RRule, RRuleSet, rrulestr } from 'rrule'
import { DateTime } from 'luxon'

user.subscribe(async ($user) => {
  if ($user.uid) {
    console.log('handling templates')
    const templates = await getFirestoreCollection('/users/' + $user.uid + '/templates')
    for (const template of templates) {
      fillTaskInstances(template)
    }
  }
})

function fillTaskInstances (template) {
  if (!template.rrStr) return
  let { lastTaskISO, rrStr, lookahead } = template
  if (!lastTaskISO) lastTaskISO = DateTime.now().toFormat('yyyy-MM-dd')
  if (!lookahead) lookahead = 2*7
  
  const start = new Date(lastTaskISO)
  const end = DateTime.now().plus({ days: lookahead }).toJSDate()
  console.log('start =', start)
  console.log('end =', end)
  console.log('rrStr =', rrStr)
  const occurences = RRule.fromString(rrStr).between(
    start,
    end, // // 2*7, 2*31, 2*365
    false // excludes start date
  )

  for (const occurence of occurences) {
    console.log("would create this =", {
      id: template.id + '_' + occurence.toISOString(), // be clear about format, 
      newTaskObj: Task.schema.parse(template)
    })
    // should the ID be cleaner? 
    
    // Task.create({
    //   id: template.id + '_' + occurence.toISOString(), // be clear about format, 
    //   newTaskObj: Task.schema.parse(template)
    // })
  }
  console.log("occurences =", occurences)
}
