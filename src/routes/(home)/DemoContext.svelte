{@render children()}

<script>
  import { setContext } from 'svelte'
  import { get, writable } from 'svelte/store'
  import realTask from '$lib/db/models/Task.js'
  import { buildForest, findSubtree } from '$lib/db/tree.ts'

  let { children } = $props()

  const clickedTaskID = writable('')
  const familyTree = writable(null)
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
    update: ({ id, kvChanges }) => {
      firestoreDocs.update(docs => {
        // deep copies of everything
        for (let i = 0; i < docs.length; i++) {
          if (docs[i].id === id) {
            docs[i] = { ...docs[i], ...kvChanges }
          } else {
            docs[i] = { ...docs[i] }
          }
        }
        return docs
      })
    },
    create: ({ id, newTaskObj }) => {
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

  const tasks = [...habitTasks, ...timelineTasks, ...updateLogTasks]

  // set ids manually (TO-DO: makes the demo brittle)
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
    memoryTree.set(buildForest(docs))
  })

  clickedTaskID.subscribe(id => {
    if (!id) return

    for (const tree of get(memoryTree)) {
      const result = findSubtree({ id, tree })
      if (result) {
        familyTree.set(result)
      }
    }
  })

  setContext('app', {
    User, user,
    Task,
    tasksCache, 
    memoryTree,
    clickedTaskID,
    familyTree,
    closeTaskPopup: () => clickedTaskID.set(''),
    openTaskPopup: (task) => clickedTaskID.set(task.id), 
    uploadMockPhoto: ({ id }) =>{
      Task.update({
        id,
        kvChanges: {
          imageDownloadURL: '/optimized_camino.jpg',
          notes: `Tired as hell but the scenery was great. Met some really great people.`
        }
      })
    }
  })

  setContext('popover-input', {
    activateInput: () => {} // quick-fix to avoid error
  })
</script>