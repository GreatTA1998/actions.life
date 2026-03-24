import { getFirestoreQuery } from '$lib/db/helpers.js'
import { query, collection, where } from 'firebase/firestore'
import { db } from '$lib/db/init.js'
import Template from '$lib/db/models/Template.js'
import Task from '$lib/db/models/Task.js'
import { DateTime } from 'luxon'

// HOW TO USE: 
// import { resetTaggedTasks } from '$lib/db/scripts/2026-02-12.js'
// window.resetTaggedTasks = resetTaggedTasks('yGVJSutBrnS1156uopQQOBuwpMl2')

function helper ({ dataArray, conditionFunc, updateFunc }) {
  for (const data of dataArray) {
    if (conditionFunc(data)) {
      count += 1
      updateFunc()
    }
  }
}

// 13209 tasks
export async function deprecatePersistsOnList ({ uid, testRun = true }) {
  const q = query(
    collection(db, `/users/${uid}/tasks`)
  )
  const tasks = await getFirestoreQuery(q)
 
  let count = 0
  for (const task of tasks) {
    const { id, persistsOnList, isArchived, onList } = task
    if (typeof persistsOnList === 'boolean' && typeof isArchived === 'boolean') {
      // console.log('task =', task)

      if (!onList) {
        count += 1
        // console.log('kvChanges =', kvChanges)
        const kvChanges = {
          id,
          onList: persistsOnList && !isArchived
        }
        if (!testRun) {
          Task.update({ 
            id,
            kvChanges,
            undoable: false
          })
        }
      }
    } else {
      // technically should migrate based on `startDateISO`
      console.log('persistsOnList already undefined')
    }
  }
  console.log(`Migrated ${count} templates`)
}

export async function migrateTemplates (uid, testRun = true) {
  const q = query(
    collection(db, `/users/${uid}/templates`)
  )
  const templates = await getFirestoreQuery(q)
 
  let count = 0
  for (const template of templates) {
    if (!template.rootID || !template.parentID) {
      const kvChanges = {}
      if (!template.rootID) kvChanges.rootID = template.id
      if (!template.parentID) kvChanges.parentID = ''

      if (Object.keys(kvChanges).length === 0) continue
      else {
        count += 1
        console.log('kvChanges =', kvChanges)
        const { name, rootID, parentID } = template
        console.log('task.name, .rootID =', name, rootID, parentID)
        if (!testRun) {
          Template.update({ 
            id: template.id, 
            kvChanges
          })
        }
      }      
    }
  }
  console.log(`Migrated ${count} templates`)
}

export async function rerunRoutineGeneration (uid, testRun = true) {
  const q = query(
    collection(db, `/users/${uid}/templates`)
  )
  const templates = await getFirestoreQuery(q)
 
  let count = 0
  for (const template of templates) {
    if (template.name === 'Meditate') continue

    if (['Sunshine', 'Eye exercise'].includes(template.name)) {
      console.log('template.name, .prevEndISO =', template.name, template.prevEndISO)
      console.log('kvChanges =',  DateTime.utc().toFormat('yyyy-MM-dd'))
      if (!testRun) {
        Template.update({ 
          id: template.id, 
          kvChanges: {
            prevEndISO: DateTime.utc().toFormat('yyyy-MM-dd')
          }
        })
      }
      count += 1
    }
  }
  console.log(`Migrated ${count} templates`)
}