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
  const clickedTaskID = writable('')

  // Mock stores
  export const mockStores = {
    user: writable({ uid: 'demo-user', maxOrderValue: 100 }),
    defaultPhotoLayout: writable('side-by-side')
  }

  const init = realTask.schema.parse

  const updateLogTasks = [
    init({ name: 'Update Log', childrenLayout: 'timeline' }),
    init({ 
      name: 'life-organizer.com', 
      startDateISO: '2021-01-15',
      imageDownloadURL: '/life-organizer.com.jpg', 
      notes: "First prototype for a recursive task trees next to a calendar column",
      parentID: 'Update Log'
    }),
    init({
      name: 'intentions.life',
      startDateISO: '2024-01-15',
      notes: "Complete overhaul of the timeline visualization with better chronological organization.",
      parentID: 'Update Log'
    }),
    init({
      name: 'Maryus Martsalius',
      notes: 'Improved load times from O(n) with respect to # of tasks to constant, migrated legacy schemas to standardized schemas, daily back-ups, introduced AI, infinite scroll, resizeable areas...(to be updated)',
      parentID: 'intentions.life'
    }),
    init({
      name: 'Backend infrastructure overhaul',
      notes: 'Joi schemas, multiple back-up firebase instances, fine-grained reactivity',
      parentID: 'Maryus Martsalius'
    }),
    init({
      name: 'Frontier features',
      notes: 'AI can leverage the calendar logs for insights. The rest were UI mechanisms that were unusual but more natural.',
      parentID: 'Maryus Martsalius'
    }),
    init({
      name: 'AI',
      parentID: 'Frontier features',
      notes: 'Details to be added about the design process and trade-offs'
    }),
    init({
      name: 'Infinite scroll',
      parentID: 'Frontier features',
      notes: 'Details to be added about the design process and trade-offs'
    }),
    
    init({
      name: 'Resizeable areas',
      parentID: 'Frontier features',
      notes: 'Details to be added about the design process and trade-offs'
    }),
    init({
      name: 'actions.life',
      startDateISO: '2025-05-15',
      notes: 'Timelines as a first-class citizen, multi-lists',
      parentID: 'Update Log'
    })
  ]
  const tasksCache = writable({})

  const tasks = [...updateLogTasks]
  for (const task of tasks) {
    task.id = task.name
    tasksCache.update(cache => {
      cache[task.id] = task
      return cache
    })
  }


  const firestoreDocs = writable(tasks)
  const memoryTree = derived(firestoreDocs, () => reconstructTreeInMemory($firestoreDocs))

  export const Task = {
    update: ({ id, keyValueChanges }) => {
      console.log('Demo: Would update task', id, 'with', keyValueChanges)


      firestoreDocs.update(docs => {
        for (let i = 0; i < docs.length; i++) {
          if (docs[i].id === id) {
            docs[i] = { ...docs[i], ...keyValueChanges }
          }
        }
        return docs
      })


      tasksCache.update(cache => {
        if (cache[id]) {
          cache[id] = { ...cache[id], ...keyValueChanges }
        }
        return cache
      })
    },
    create: ({ id, newTaskObj }) => {
      console.log('Demo: Would create task', id, newTaskObj)
    },
    delete: ({ id }) => {
      console.log('Demo: Would delete task', id)
    },
    archiveTree: ({ id }) => {
      console.log('Demo: Would archive tree', id)
    }
  }

  setContext('app', {
    Task,
    tasksCache,
    clickedTaskID,
    closeTaskPopup: () => { 
      clickedTaskID.set('')
    },
    ancestralTree: mockStores.ancestralTree,
    openTaskPopup: (task) => {
      clickedTaskID.set(task.id)
    },
    memoryTree
  })
</script>