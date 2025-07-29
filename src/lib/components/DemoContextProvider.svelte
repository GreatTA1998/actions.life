<slot>
  
</slot>

<script>
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'

  const isTaskPopupOpen = writable(false)
  const settingsOpen = writable(false)
  const hasFetchedUser = writable(true)
  const tasksCache = writable({})
  const clickedTaskID = writable('')

  // Mock stores
  export const mockStores = {
    tasksCache: writable({}),
    user: writable({ uid: 'demo-user', maxOrderValue: 100 }),
    activeDragItem: writable(null),
    defaultPhotoLayout: writable('side-by-side'),
    openTaskPopup: (task) => console.log('Demo: Would open popup for:', task.name),
    closeTaskPopup: () => { 
      clickedTaskID.set('')
      console.log('Demo: Would close popup') 
    },
    grabOffset: writable(0)
  }

  export const Task = {
    update: ({ id, keyValueChanges }) => {
      console.log('Demo: Would update task', id, 'with', keyValueChanges)
      // Update local mock data for visual feedback
      mockStores.tasksCache.update(cache => {
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

  export const demoData = {
    timeline: {
      id: 'demo-root',
      name: 'Running',
      isDone: false,
      isCollapsed: false,
      startDateISO: '2024-01-01',
      childrenLayout: 'normal',
      children: [
        { id: 'demo-1', name: 'Start training', isDone: true, startDateISO: '2024-01-01', children: [] },
        { id: 'demo-3', name: 'Break 25:00 in 5K', isDone: true, startDateISO: '2024-04-01', children: [] },
        { id: 'demo-4', name: 'Boston Marathon', isDone: false, startDateISO: '2024-04-15', children: [] },
        { id: 'demo-5', name: 'Chicago Marathon', isDone: false, startDateISO: '2025-10-13', children: [] }
      ]
    },
    
    habits: [
      { id: 'run', name: 'Morning Run', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FEPtvgSIsPkpznSIffOoa.png?alt=media&token=018a960d-1f76-47eb-a0fe-85c6a5423bd9', isDone: true },
      { id: 'stretch', name: 'Post-Run Stretch', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2F6w6I9VRWZLRWqphuLgFz.png?alt=media&token=ba68dd3b-83fe-4ed2-bc38-9a2888d31f1b', isDone: true },
      { id: 'hydrate', name: 'Hydration Check', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FhsCFkECSF4PcFt6MOcW0.png?alt=media&token=d4ed8987-9001-43bc-b48b-4f36caef6fb1', isDone: false },
      { id: 'nutrition', name: 'Track Nutrition', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2Fk49WsIjV1kQ2e6MW52BR.png?alt=media&token=d4ed8987-9001-43bc-b48b-4f36caef6fb1', isDone: false }
    ],
    
    journal: {
      id: 'demo-journal',
      name: 'Chicago Marathon',
      isDone: true,
      notes: '',
      startTime: '07:00',
      startDateISO: new Date().toISOString().split('T')[0],
      duration: 240,
      imageDownloadURL: '',
      photoLayout: 'side-by-side'
    }
  } 

  setContext('app', {
    Task,
    tasksCache,
    clickedTaskID,
    closeTaskPopup: mockStores.closeTaskPopup,
    ancestralTree: mockStores.ancestralTree,
    openTaskPopup: mockStores.openTaskPopup,
    activeDragItem: mockStores.activeDragItem
  })
</script>