import { pureNumericalHourForm } from '/src/helpers/everythingElse.js'

/**
 * @param {Array} firestoreTaskDocs all necessary ingredient tasks to reconstruct 
 * not only the scheduled tasks, but also their subtrees (sub-tasks from any arbitrary date)
 * @returns 
 */
export function constructCalendarTrees(firestoreTaskDocs) {
  const cache = new Map()
  
  // Build task map and connect parent-child relationships
  const taskMap = new Map()
  firestoreTaskDocs.forEach(task => {
    taskMap.set(task.id, { ...task, children: [] })
  })
  
  const rootTasks = [];
  taskMap.forEach(task => {
    if (!task.parentID || !taskMap.has(task.parentID)) {
      rootTasks.push(task)
    } else {
      const parent = taskMap.get(task.parentID)
      parent.children.push(task)
    }
  })
  
  // Every scheduled node is a calendar entry, with its full subtree
  const output = []
  firestoreTaskDocs.forEach(task => {
    if (task.startDateISO) {
      const taskTree = deepCopyWithSubtree(task, taskMap, cache)
      output.push(taskTree);
    }
  })
  
  return output
}

// Deep copy a task with its subtree
function deepCopyWithSubtree(task, taskMap, cache) {
  if (cache.has(task.id)) {
    return cache.get(task.id)
  }
  
  const rootNode = { ...task, children: [] }
  cache.set(task.id, rootNode)
  
  const children = []
  taskMap.forEach(potentialChild => {
    if (potentialChild.parentID === task.id) {
      const childTree = deepCopyWithSubtree(potentialChild, taskMap, cache)
      children.push(childTree)
    }
  });
  
  rootNode.children = children
  return rootNode
}

// Create a date-to-tasks mapping for calendar view
export function computeDateToTasksDict(taskTrees) {
  const dateToTasks = {}
  
  // All tasks in taskTrees already have startDateISO, so no need to check again
  taskTrees.forEach(task => {
    addTaskToDate(task, task.startDateISO, dateToTasks)
  });
  
  // Sort tasks with startTime for predictable drag behavior
  for (const [key, value] of Object.entries(dateToTasks)) {
    if (value.hasStartTime && value.hasStartTime.length > 0) {
      value.hasStartTime = value.hasStartTime.sort((a, b) => {
        return pureNumericalHourForm(a.startTime) - pureNumericalHourForm(b.startTime)
      });
    }
  }
  
  return dateToTasks
}

// Add a task to the appropriate category in the date dictionary
function addTaskToDate(task, date, dateToTasks) {
  if (!dateToTasks[date]) {
    dateToTasks[date] = { 
      hasStartTime: [], 
      noStartTime: { 
        hasIcon: [], 
        noIcon: [] 
      } 
    };
  }
  
  if (task.startTime) {
    dateToTasks[date].hasStartTime.push(task)
  } else if (task.iconName || task.iconURL) {
    dateToTasks[date].noStartTime.hasIcon.push(task)
  } else {
    dateToTasks[date].noStartTime.noIcon.push(task)
  }
}

// Build a memory tree from flat task documents (legacy function, still used for the legacy todo list)
export function reconstructTreeInMemory(firestoreTaskDocs) {
  const output = []

  // Build parent-child mapping
  const memo = { '': [] }
  for (const taskDoc of firestoreTaskDocs) {
    if (!memo[taskDoc.parentID]) memo[taskDoc.parentID] = []
    memo[taskDoc.parentID].push(taskDoc)

    if (!memo[taskDoc.id]) memo[taskDoc.id] = []
  }

  // Construct tree from root tasks
  const rootTasks = memo[''] || []
  for (const rootTask of rootTasks) {
    recursivelyHydrateChildren(rootTask, memo)
    output.push(rootTask)
  }
  
  return output
}

function recursivelyHydrateChildren(node, memo) {
  node.children = memo[node.id] || []
  for (const child of node.children) {
    recursivelyHydrateChildren(child, memo)
  }
}
