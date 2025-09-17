{@render children()}

<script>
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import realTask from '$lib/db/models/Task.js'
  import { reconstructTreeInMemory } from '/src/routes/[user]/components/ListsArea/service.js'

  let { children } = $props()

  const clickedTaskID = writable('')
  const user = writable({
    uid: 'demo-user',
    maxOrderValue: 100
  })

  const User = {
    update: (uid, kvChanges) => {
      user.update(() => {
        for (const k in kvChanges) {
          user[k] = kvChanges[k]
        }
        return user
      })
    }
  }

  const Task = {
    update: ({ id, keyValueChanges }) => {
      firestoreDocs.update(docs => {
        // deep copies of everything
        for (let i = 0; i < docs.length; i++) {
          if (docs[i].id === id) {
            docs[i] = { ...docs[i], ...keyValueChanges }
          } else {
            docs[i] = { ...docs[i] }
          }
        }
        return docs
      })
    },
    create: ({ id, newTaskObj }) => {
      console.log('create task =', newTaskObj)
      firestoreDocs.update(docs => [...docs, { ...newTaskObj, id: newTaskObj.name }])
    },
    // DANGER, SHOULD BE PROPERLY IMPLEMENTED, AND OTHER PARTS
    // THAT REFERENCE SPECIFIC TASKS SHOULD USE ID TO BE MORE ROBUST
    delete: ({ id }) => {
      firestoreDocs.update(docs => {
        // deep copies of everything
        const temp = []
        for (let i = 0; i < docs.length; i++) {
          if (docs[i].id === id) {
            continue
          } else {
            temp.push({ ...docs[i] })
          }
        }
        return temp
      })
    },
    archiveTree: ({ id }) => {
      console.log('Demo: Would archive tree', id)
    }
  }

  const init = realTask.schema.parse

  const habitTasks = [
    init({ name: 'Water the plant', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FEPtvgSIsPkpznSIffOoa.png?alt=media&token=018a960d-1f76-47eb-a0fe-85c6a5423bd9' }),
    init({ name: 'Drink water', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2F6w6I9VRWZLRWqphuLgFz.png?alt=media&token=ba68dd3b-83fe-4ed2-bc38-9a2888d31f1b' }),
    init({ name: 'Meditate', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FhsCFkECSF4PcFt6MOcW0.png?alt=media&token=d4ed8987-9001-43bc-b48b-4f36caef6fb1' }),
    init({ name: 'Dry laundry', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2Fk49WsIjV1kQ2e6MW52BR.png?alt=media&token=0d44da5b-dfd7-4ff3-9971-3637b748c6be' })
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
      parentID: 'Walk the Camino de Santiago',
      duration: 120
    })
  ]

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

  const tasks = [...habitTasks, ...timelineTasks, ...updateLogTasks]

  // set ids manually
  for (let i = 0; i < tasks.length; i++) {
    tasks[i].id = tasks[i].name
    tasks[i].orderValue = i + 1
  }

  const firestoreDocs = writable(tasks)
  const tasksCache = writable({})
  const memoryTree = writable([])

  firestoreDocs.subscribe(docs => {
    const temp = {}
    for (const task of docs) {
      temp[task.id] = task
    }
    tasksCache.set(temp)
    memoryTree.set(reconstructTreeInMemory(docs))
  })

  setContext('app', {
    User, user,
    Task,
    tasksCache, 
    memoryTree,
    clickedTaskID,
    closeTaskPopup: () => clickedTaskID.set(''),
    openTaskPopup: (task) => clickedTaskID.set(task.id), 
    uploadMockPhoto: ({ id }) =>{
      Task.update({
        id,
        keyValueChanges: {
          imageDownloadURL: '/optimized_camino.jpg',
          notes: `Tired as hell but the scenery was great. Met some really great folks.`
        }
      })
    }
  })
</script>