import { getFirestoreCollection, updateFirestoreDoc } from '/src/lib/db/helpers.js'

// CHECKLIST FOR ADDING A NEW PROPERTY
// 1. Run script
// 2. Add to schema

// how to abstract the counting & the test run safety mechanism?
// RUN THIS ONCE AFTER YOU'RE READY TO DEPLOY A SAFE TO USE NEW VERSION
export async function migrateAllUsers (testRun = true) {
  const users = await getFirestoreCollection('/users')
  for (const user of users) {
    console.log("migrating user =", user.uid)
    migratePersistOnList(user.uid, testRun)
  }
}

// Fixes the brittleness of non-persistent tasks in the list: scheduling them causes them to disappear
// correctness argument:
//     - we filter exactly for tasks that are already in the ListArea i.e. !persistsOnList && !startDateISO && !isArchived
//        - updating `persistsOnList` to `true` doesn't have immediate effects. It just sets them up for future interactions.
//        -  no extra tasks will appear in the UI for the user
//        - note: because archive applies to all descendants, some isolated nodes that look like they
//         that I don't remember seeing will match the filter, but it's only because their root ancestor is archived
export async function migratePersistsOnList (uid, testRun = true) {
  const tasks = await getFirestoreCollection(`/users/${uid}/tasks`)
  let count = 0
  for (const task of tasks) {
    if (!task.persistsOnList && !task.startDateISO && !task.isArchived) { // i.e. appears on the list, but is brittle
      count += 1
      console.log("task =", task.name, task)
      if (!testRun) {
        updateFirestoreDoc(`/users/${uid}/tasks/${task.id}`, {
          persistsOnList: true
        })
      }
    }
  }
  console.log("successfully migrated", count, "tasks")
}