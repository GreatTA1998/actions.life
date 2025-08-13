<slot>

</slot>

<script>
  import { setContext } from 'svelte'
  import { writable, derived } from 'svelte/store'
  import realTask from '$lib/db/models/Task.js'
  import { reconstructTreeInMemory } from '/src/routes/[user]/components/ListsArea/service.js'

  const isTaskPopupOpen = writable(false)
  const settingsOpen = writable(false)
  const hasFetchedUser = writable(true)
  const tasksCache = writable({})
  const clickedTaskID = writable('')

  // completely local database
  // but leverage the same API as the real database

  // Mock stores
  export const mockStores = {
    tasksCache: writable({}),
    user: writable({ uid: 'demo-user', maxOrderValue: 100 }),
    activeDragItem: writable(null),
    defaultPhotoLayout: writable('side-by-side'),
    openTaskPopup: (task) => console.log('Demo: Would open popup for:', task.name),
    closeTaskPopup: () => {
      clickedTaskID.set('')
    },
    grabOffset: writable(0)
  }

  export const Task = {
    update: ({ id, keyValueChanges }) => {
      firestoreDocs.update(docs => {
        for (let i = 0; i < docs.length; i++) {
          if (docs[i].id === id) {
            console.log("docs[i] =", docs[i])
            docs[i] = { ...docs[i], ...keyValueChanges }
          }
        }
        return docs
      })

      console.log('Demo: Would update task', id, 'with', keyValueChanges)

      // cache related logic
      mockStores.tasksCache.update(cache => {
        if (cache[id]) {
          cache[id] = { ...cache[id], ...keyValueChanges }
        }
        return cache
      })
    },
    create: ({ id, newTaskObj }) => {
      firestoreDocs.update(docs => [...docs, { ...newTaskObj, id: newTaskObj.name }])
    },
    delete: ({ id }) => {
      console.log('Demo: Would delete task', id)
    },
    archiveTree: ({ id }) => {
      console.log('Demo: Would archive tree', id)
    }
  }

  const init = realTask.schema.parse

  const habitTasks = [
    init({ name: 'Morning Run', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FEPtvgSIsPkpznSIffOoa.png?alt=media&token=018a960d-1f76-47eb-a0fe-85c6a5423bd9' }),
    init({ name: 'Post-Run Stretch', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2F6w6I9VRWZLRWqphuLgFz.png?alt=media&token=ba68dd3b-83fe-4ed2-bc38-9a2888d31f1b' }),
    init({ name: 'Hydration Check', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FhsCFkECSF4PcFt6MOcW0.png?alt=media&token=d4ed8987-9001-43bc-b48b-4f36caef6fb1' }),
    init({ name: 'Track Nutrition', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2Fk49WsIjV1kQ2e6MW52BR.png?alt=media&token=0d44da5b-dfd7-4ff3-9971-3637b748c6be' })
  ]

  const timelineTasks = [
    init({
      name: 'Walk the Camino de Santiago',
      startDateISO: '2026-01-01'
    }),
    init({
      name: 'Start training',
      startDateISO: '2025-08-31',
      parentID: 'Walk the Camino de Santiago'
    }),
    init({
      name: 'End of trail',
      startDateISO: '2026-08-31',
      parentID: 'Walk the Camino de Santiago'
    })
  ]

  const journalTask = init({
    name: 'End of trail',
    startTime: '07:00',
    startDateISO: '2026-08-31',
    duration: 120
  })

  const updateLogTasks = [
    init({ name: 'Update Log', childrenLayout: 'timeline' }),
    init({
      name: 'life-organizer.com',
      imageDownloadURL: '/life-organizer.com.jpg',
      notes: "First prototype for a recursive task trees next to a calendar column",
      parentID: 'Update Log'
    }),
    init({
      name: 'intentions.life',
      notes: "Complete overhaul of the timeline visualization with better chronological organization.",
      parentID: 'Update Log'
    }),
    init({
      name: 'Maryus Martsalius',
      notes: 'Improved load times from O(n) with respect to # of tasks to constant, migrated legacy schemas to standardized schemas, daily back-ups, introduced AI, infinite scroll, resizeable areas...(to be updated)',
      parentID: 'intentions.life'
    }),
    init({
      name: 'actions.life',
      notes: 'Timelines as a first-class citizen, multi-lists',
      parentID: 'Update Log'
    })
  ]

  const tasks = [...habitTasks, ...timelineTasks, journalTask, ...updateLogTasks]

  // IMPORTANT
  // SET THE IDS MANUALLY HERE
  for (const task of tasks) {
    task.id = task.name
  }

  const firestoreDocs = writable(tasks)
  const memoryTree = derived(firestoreDocs, () => reconstructTreeInMemory($firestoreDocs))

  console.log("memoryTree =", $memoryTree)

  setContext('app', {
    Task,
    tasksCache,
    clickedTaskID,
    closeTaskPopup: mockStores.closeTaskPopup,
    ancestralTree: mockStores.ancestralTree,
    openTaskPopup: mockStores.openTaskPopup,
    activeDragItem: mockStores.activeDragItem,
    memoryTree
  })
</script>