import { DateTime } from "luxon"
import { 
  buildTodoDataStructures, 
  buildCalendarDataStructures, 
  buildEventsDataStructures } from "/src/helpers/maintainState"
import Tasks from "/src/back-end/Tasks"
import { size, cushion } from '/src/helpers/constants.js'
import { get } from "svelte/store"
import { calendarTasks, loadingTasks } from '/src/store'

export function handleInitialTasks(uid) {
  loadingTasks.set(true);
  const today = DateTime.now();
  const left = today.minus({ days: size + cushion })
  const right = today.plus({ days: size + cushion })

  return Promise.all([
    Tasks.getByDateRange(uid,
      left.toFormat("yyyy-MM-dd"),
      right.toFormat("yyyy-MM-dd")
    ).then((scheduledTasks) =>
      buildCalendarDataStructures({ flatArray: scheduledTasks })
    ),

    Tasks.getUnscheduled(uid).then(unscheduledTasks =>
      buildTodoDataStructures({ flatArray: unscheduledTasks })
    )]).then(() => loadingTasks.set(false)).catch(err => {
      console.error('error in handleInitialTasks()', err)
      alert('error in handleInitialTasks(), please try reloading the page and contact support if the issue persists');
    })
}

export function fetchMobileTodoTasks(uid) {
  Tasks.getUnscheduled(uid).then(unscheduledTasks => {
    buildTodoDataStructures({ flatArray: unscheduledTasks })
  })
}

export async function fetchMobileCalTasks(uid) {
  return new Promise(async (resolve) => {
    const today = DateTime.now()
    const surroundingTasks = await Tasks.getByDateRange(
      uid,
      today.minus({ days: 7 }).toFormat('yyyy-MM-dd'),
      today.plus({ days: 7 }).toFormat('yyyy-MM-dd')
    )
    buildCalendarDataStructures({
      flatArray: surroundingTasks
    })
    resolve()
  })
}

// NOTE: mobile fetches will merge and build upon existing fetched data
export async function fetchMobileFutureOverviewTasks (uid, hideRoutines = false) {
  const today = DateTime.now()
  let futureTasks = await Tasks.getByDateRange(
    uid,
    today.toFormat('yyyy-MM-dd'),
    today.plus({ years: 2 }).toFormat('yyyy-MM-dd')
  )

  if (hideRoutines) {
    futureTasks = futureTasks.filter(task => task.templateID === "")
  }
  buildEventsDataStructures({ flatArray: futureTasks })
}


