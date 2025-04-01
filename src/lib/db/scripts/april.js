import { getFirestoreCollection, updateFirestoreDoc } from '/src/lib/db/helpers.js'

export async function convertTasksToNonPersist (uid) {
  const tasks = await getFirestoreCollection(`/users/${uid}/tasks`)
  for (const task of tasks) {
    if (task.listID == '') {
      console.log('no ID found, converting')
      updateFirestoreDoc(`/users/${uid}/tasks/${task.id}`, {
        persistsOnList: false,
      })
    }
  }
}