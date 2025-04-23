import { getFirestoreCollection, updateFirestoreDoc } from '/src/lib/db/helpers.js'
import { reconstructTreeInMemory } from '/src/routes/[user]/components/ListsArea/todoService.js'
import { writeBatch, doc } from 'firebase/firestore'
import { db } from '/src/lib/db/init.js'
import { isValidISODate } from '/src/lib/db/models/Task.js'

export async function migrateTemplates (uid, testRun = true) {
  const templates = await getFirestoreCollection(`/users/${uid}/templates`)
  const promises = []
  for (const template of templates) {
    if (template.imageDownloadURL === undefined) {
      console.log("found undefined =", template.imageDownloadURL)

      if (!testRun) {
        promises.push(
          updateFirestoreDoc(`/users/${uid}/templates/${template.id}`, { 
            imageDownloadURL: '' 
          })
        )
      }
    }
  }
  await Promise.all(promises)
}


// DANGER, as once you fuck up startDateISOs, you can't get them back
export async function fixInvalidStartDateISOs (uid, testRun = true) {
  console.log('testRun = ', testRun)
  const tasks = await getFirestoreCollection(`/users/${uid}/tasks`)
  const forest = reconstructTreeInMemory(tasks)
  const batches = []
  let count = 0
  for (const tree of forest) {
    const batch = writeBatch(db)
    helper(tree, node => {
      if (!isValidISODate(node.startDateISO)) {
        console.log('incorrectISO =', node.startDateISO)
        batch.update(doc(db, `users/${uid}/tasks/${node.id}`), {
          startDateISO: getCorrectISO(node)
        })
        console.log('correctISO =', getCorrectISO(node))
        count += 1
      }
    })    
    if (!testRun) {
      batches.push(batch.commit())
    }
  }
  await Promise.all(batches)
  console.log('promise resolved, updated', count, 'tasks')
}

// this function assumes all the user only has legacy todo tasks
// for experimental users, the persistentTasks will become non-persistent,
// as persistsOnList is to false ffor everyone
// worst case: augmented properties are wrong
//   lose new data integrity e.g. my timelines are not preserved
export async function migrateBasicProperties (uid, testRun = true) {
  console.log('testRun = ', testRun)
  const tasks = await getFirestoreCollection(`/users/${uid}/tasks`)
  let count = 0
  const promises = []
  for (const task of tasks) {
    if (!testRun) {
      promises.push(
        updateFirestoreDoc(`/users/${uid}/tasks/${task.id}`, {
          persistsOnList: !!task.persistsOnList,
          isArchived: !!task.isDone,
          photoLayout: task.photoLayout ? task.photoLayout : 'full-photo',
          childrenLayout: task.childrenLayout ? task.childrenLayout : 'normal'
        })
      )
      if (!!task.isDone === undefined || !!task.persistsOnList === undefined) {
        console.log('task =', task)
      }
    }
    count += 1
  }
  await Promise.all(promises)
  console.log('successfully migrated', count, 'tasks')
}

export async function migrateCalendarTasks (uid, testRun = true) {
  console.log('testRun = ', testRun)
  const tasks = await getFirestoreCollection(`/users/${uid}/tasks`)

  const forest = reconstructTreeInMemory(tasks)
  console.log('forest.length =', forest.length)
  let count = 0
  const batches = []
  for (const tree of forest) {
    const batch = writeBatch(db)
    const treeISOs = []

    // compute treeISOs
    helper(tree, node => {
      if (node.startDateISO && isValidISODate(node.startDateISO)) {
        treeISOs.push(node.startDateISO)
      } 
    })

    // update rootID & treeISOs
    helper(tree, node => {
      batch.update(doc(db, `users/${uid}/tasks/${node.id}`), {
        rootID: tree.id,
        treeISOs
      })
      count += 1
    })

    if (!testRun) {
      batches.push(batch.commit())
    }
  }
  await Promise.all(batches)
  console.log('successfully migrated', count, 'calendar tasks')
}

function helper (node, callback) {
  callback(node)
  for (const child of node.children) {
    helper(child, callback)
  }
}

function getCorrectISO (node) {
  if (isValidPartialDate(node.startDateISO)) { // handle -06-25, -01-18 etc.
    return '2024' + node.startDateISO
  }
  else { // handle '-Nan-NaN', or '-'
    return '' 
  }
}

// Validate partial date string in format "-MM-DD"
function isValidPartialDate(dateStr) {
  // Check format with regex (-MM-DD)
  const partialDateRegex = /^-\d{2}-\d{2}$/
  if (!partialDateRegex.test(dateStr)) return false
  
  // Extract month and day
  const [_, month, day] = dateStr.match(/-(\d{2})-(\d{2})/)
  
  // Use current year to check validity
  const currentYear = new Date().getFullYear()
  const fullDateStr = `${currentYear}${dateStr}`
  const date = new Date(fullDateStr)
  
  // Check if valid date and if parsed month/day match inputs
  return !isNaN(date.getTime()) && 
         date.getMonth() + 1 === parseInt(month, 10) && 
         date.getDate() === parseInt(day, 10)
}