{@render children()}

<script>
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import realTask from '$lib/db/models/Task.js'
  import { reconstructTreeInMemory } from '/src/routes/[user]/components/ListsArea/service.js'

  let { children } = $props()

  setContext('list', {
    isLargeFont: writable(false)
  })

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
      name: 'v0 - life-organizer.com', 
      startDateISO: '2021-01-15',
      imageDownloadURL: '/life-organizer.com.jpg', 
      notes: "First prototype for a recursive task trees next to a calendar column",
      parentID: 'Update Log'
    }),
    init({
      name: 'v1 - intentions.life (Maryus Martsyalis)',
      startDateISO: '2024-01-15',
      notes: "Dad and Maryus discussing their ideas about the app over hotpot in Shibuya.",
      parentID: 'Update Log',
      imageDownloadURL: '/dad-marius.jpeg',
      duration: 90
    }),
    init({
      name: 'Rework infrastructure (1-5s faster load)',
      notes: 'Core reliability and data model refactors.',
      parentID: 'v1 - intentions.life (Maryus Martsyalis)',
      isCollapsed: true
    }),
    init({
      name: 'Backend-generated routines & templates (crontab → rrules)',
      notes: 'Moved from crontab-based generation to robust rrule-driven scheduling.',
      parentID: 'Rework infrastructure (1-5s faster load)'
    }),
    init({
      name: 'Database back-ups',
      notes: 'Automated, regular backups to protect user data.',
      parentID: 'Rework infrastructure (1-5s faster load)'
    }),
    init({
      name: 'Icon migrations',
      notes: 'Converted icon URLs to efficient, cached download links.',
      parentID: 'Rework infrastructure (1-5s faster load)'
    }),
    init({
      name: 'Schemas and conversions (Joi → Zod)',
      notes: 'Consolidated validation and conversion logic. Tracked as a timeline thread.',
      childrenLayout: 'timeline',
      parentID: 'Rework infrastructure (1-5s faster load)'
    }),
    init({
      name: 'Other improvements',
      notes: 'Quality-of-life and stability fixes.',
      parentID: 'v1 - intentions.life (Maryus Martsyalis)',
      isCollapsed: true
    }),
    init({
      name: 'Doodle drawing',
      notes: 'Added freehand and mouse drawing support.',
      parentID: 'Other improvements'
    }),
    init({
      name: 'Tree deletion',
      notes: '',
      parentID: 'Other improvements'
    }),
    init({
      name: 'Accessibility & loading fixes',
      notes: 'Resolved Svelte a11y warnings and ensured loading screens show correctly.',
      parentID: 'Other improvements'
    }),
    init({
      name: 'AI robot',
      notes: 'System prompt and favorited questions.',
      parentID: 'Experimental designs',
      isDone: true
    }),
    init({
      name: 'Notifications',
      notes: 'Firebase Messaging, FCM tokens, service workers. Deprecated on mobile browsers; email considered instead. Two large-scale PRs.',
      parentID: 'v1 - intentions.life (Maryus Martsyalis)',
      childrenLayout: 'timeline',
      isCollapsed: true
    }),
    init({
      name: 'Desktop support (Firebase Messaging)',
      notes: 'Client registration, token lifecycle, and backend integration.',
      parentID: 'Notifications',
      startDateISO: '2024-09-01',
    }),
    init({
      name: 'Deprecated (no mobile support)',
      notes: '',
      parentID: 'Notifications',
      startDateISO: '2025-05-01'
    }),
    init({
      name: 'Experimental designs',
      notes: 'Pushing on interaction and layout paradigms.',
      parentID: 'v1 - intentions.life (Maryus Martsyalis)',
      isCollapsed: true,
      isDone: true
    }),
    init({
      name: 'Resizable area with physical griplines',
      notes: 'Direct-manipulation resizing affordances.',
      parentID: 'Experimental designs',
      isDone: true
    }),
    init({
      name: 'Infinite scroll calendar',
      notes: 'Continuous timeline browsing.',
      parentID: 'Experimental designs',
      isDone: true
    }),
    init({
      name: 'Journal photo layout options',
      notes: 'Continuous timeline browsing.',
      parentID: 'Experimental designs',
      isDone: true
    }),
    init({
      name: 'v2 - actions.life',
      startDateISO: '2025-10-01',
      notes: 'Timelines as a first-class citizen, multi-lists, sweeping refactor and rearchitecture across the codebase, area-based drag-drop (deprecated pointer-based)',
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
          notes: `Tired as hell but the scenery was great. Met some really great people.`
        }
      })
    }
  })
</script>