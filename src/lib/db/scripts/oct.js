import { getFirestoreCollection } from '/src/lib/db/helpers.js'

export async function checkOrderValue () {
  const allTasks = await getFirestoreCollection('/users/yGVJSutBrnS1156uopQQOBuwpMl2/tasks')
  let count = 0
  for (const task of allTasks) {
    if (!task.orderValue) {
      console.log('task', task, 'has no orderValue')
      count += 1
    }
  }
  console.log('count', count)
}