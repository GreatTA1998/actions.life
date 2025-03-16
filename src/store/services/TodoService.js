import Tasks from '/src/back-end/Tasks'
import { get } from 'svelte/store'
import { todoTasks, todoMemoryTree, inclusiveWeekTodo, updateCache, tasksCache } from '/src/store'

const activeListeners = {
  todo: null
}

export function reconstructTreeInMemory(firestoreTaskDocs) {
  const memoryTree = []

  const memo = { '': [] }
  for (const node of firestoreTaskDocs) {
    if (!memo[node.parentID]) memo[node.parentID] = []
    if (!memo[node.id]) memo[node.id] = []
    memo[node.parentID].push(node)
  }

  const roots = memo[''].sort((a, b) => a.orderValue - b.orderValue)
  for (const root of roots) {
    extendTree(root, memo)
    memoryTree.push(root)
  }
  return memoryTree
}

function extendTree (node, memo) {
  node.children = memo[node.id]
  node.children = node.children.sort((a, b) => a.orderValue - b.orderValue)
  for (const child of node.children) {
    extendTree(child, memo)
  }
}

export function setupTodoListener(uid) {
  if (activeListeners.todo) {
    console.log('Todo listener already exists, skipping')
    return
  }
  try {
    activeListeners.todo = Tasks.listenToUnscheduled(uid, (tasks) => {
      updateTodoTasks(tasks)
    })
  } catch (error) {
    console.error('Error setting up todo listener:', error)
  }
}

/** Updates todo tasks and their memory tree representation */
export function updateTodoTasks(tasks) {
  if (!tasks || !Array.isArray(tasks)) {
    return
  }
  
  todoTasks.set(tasks)
  updateCache(tasks)
  
  const memoryTree = reconstructTreeInMemory(tasks)
  todoMemoryTree.set(memoryTree)
  inclusiveWeekTodo.set(memoryTree)
}

export async function updateTodoTask({ uid, taskID, keyValueChanges }) {
  try {
    const task = get(tasksCache)[taskID]
    
    if (!task) {
      console.warn(`Task ${taskID} not found in todo store, falling back to direct database update`)
      await Tasks.updateTaskDoc({ userUID: uid, taskID, keyValueChanges })
      return {
        taskID,
        changes: keyValueChanges
      }
    }
    
    // Handle rootStartDateISO for scheduled tasks
    if (keyValueChanges.startDateISO && keyValueChanges.startDateISO !== '') {
      let rootStartDateISO = keyValueChanges.startDateISO
      
      if (task.parentID && task.parentID !== '') {
        const parent = get(tasksCache)[task.parentID]
        if (parent && parent.rootStartDateISO) {
          rootStartDateISO = parent.rootStartDateISO
        }
      }
      
      keyValueChanges.rootStartDateISO = rootStartDateISO
    }
    
    await Tasks.updateTaskDoc({ userUID: uid, taskID, keyValueChanges })
    
    return {
      taskID,
      changes: keyValueChanges,
      originalTask: task
    }
  } catch (error) {
    console.error('Error updating todo task:', error)
    throw error
  }
}

export function cleanupTodoListener() {
  if (typeof activeListeners.todo === 'function') {
    activeListeners.todo()
    console.log('Cleaned up todo listener')
  }
  
  activeListeners.todo = null
}

export default {
  setupTodoListener,
  updateTodoTasks,
  updateTodoTask,
  cleanupTodoListener,
  reconstructTreeInMemory
}