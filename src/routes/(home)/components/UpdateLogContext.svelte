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
    tasksCache: writable({


    }),
    user: writable({ uid: 'demo-user', maxOrderValue: 100 }),
    activeDragItem: writable(null),
    defaultPhotoLayout: writable('side-by-side'),
    openTaskPopup: (task) => {
      clickedTaskID.set(task.id)
    },
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