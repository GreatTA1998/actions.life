import Tasks from "/src/back-end/Tasks";
import { get } from "svelte/store";
import { todoTasks, todoMemoryTree, inclusiveWeekTodo } from '/src/store';

const activeListeners = {
  todo: null
}

/**
 * Builds a memory tree from flat task documents
 * 
 * @param {Array} firestoreTaskDocs - Array of flat task documents
 * @returns {Array} - Array of root tasks with hydrated children
 */
export function reconstructTreeInMemory(firestoreTaskDocs) {
  const output = [];

  // Build parent-child mapping
  const memo = { '': [] };
  for (const taskDoc of firestoreTaskDocs) {
    if (!memo[taskDoc.parentID]) memo[taskDoc.parentID] = [];
    memo[taskDoc.parentID].push(taskDoc);

    if (!memo[taskDoc.id]) memo[taskDoc.id] = [];
  }

  // Construct tree from root tasks
  const rootTasks = memo[''] || [];
  for (const rootTask of rootTasks) {
    recursivelyHydrateChildren(rootTask, memo);
    output.push(rootTask);
  }
  
  return output;
}

/**
 * Helper function to recursively hydrate children in the task tree
 */
function recursivelyHydrateChildren(node, memo) {
  node.children = memo[node.id] || [];
  for (const child of node.children) {
    recursivelyHydrateChildren(child, memo);
  }
}

export function setupTodoListener(uid) {
  if (activeListeners.todo) {
    console.log("Todo listener already exists, skipping");
    return;
  }
  try {
    activeListeners.todo = Tasks.listenToUnscheduled(uid, (tasks) => {
      updateTodoTasks(tasks)
    })
  } catch (error) {
    console.error("Error setting up todo listener:", error);
  }
}

/**
 * Updates todo tasks and their memory tree representation
 */
export function updateTodoTasks(tasks) {
  if (!tasks || !Array.isArray(tasks)) {
    return;
  }
  
  todoTasks.set(tasks);
  
  const memoryTree = reconstructTreeInMemory(tasks);
  todoMemoryTree.set(memoryTree);
  inclusiveWeekTodo.set(memoryTree);
}

/**
 * Finds a task by ID from the todo tasks
 */
export function findTodoTaskById(taskID) {
  const allTodoTasks = get(todoTasks);
  return allTodoTasks.find(task => task.id === taskID);
}

/**
 * Updates a todo task
 */
export async function updateTodoTask({ uid, taskID, keyValueChanges }) {
  try {
    const task = findTodoTaskById(taskID);
    
    if (!task) {
      console.warn(`Task ${taskID} not found in todo store, falling back to direct database update`);
      await Tasks.updateTaskDoc({ userUID: uid, taskID, keyValueChanges });
      return {
        taskID,
        changes: keyValueChanges
      };
    }
    
    // Handle rootStartDateISO for scheduled tasks
    if (keyValueChanges.startDateISO && keyValueChanges.startDateISO !== "") {
      let rootStartDateISO = keyValueChanges.startDateISO;
      
      if (task.parentID && task.parentID !== "") {
        const parent = findTodoTaskById(task.parentID);
        if (parent && parent.rootStartDateISO) {
          rootStartDateISO = parent.rootStartDateISO;
        }
      }
      
      keyValueChanges.rootStartDateISO = rootStartDateISO;
    }
    
    await Tasks.updateTaskDoc({ userUID: uid, taskID, keyValueChanges });
    
    return {
      taskID,
      changes: keyValueChanges,
      originalTask: task
    };
  } catch (error) {
    console.error("Error updating todo task:", error);
    throw error;
  }
}

export function cleanupTodoListener() {
  if (typeof activeListeners.todo === 'function') {
    activeListeners.todo();
    console.log("Cleaned up todo listener");
  }
  
  activeListeners.todo = null;
}

export default {
  setupTodoListener,
  updateTodoTasks,
  findTodoTaskById,
  updateTodoTask,
  cleanupTodoListener,
  reconstructTreeInMemory
};