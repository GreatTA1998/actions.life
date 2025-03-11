import Tasks from "/src/back-end/Tasks";
import { reconstructTreeInMemory } from "/src/helpers/dataStructures.js";
import { get } from "svelte/store";
import { todoTasks, todoMemoryTree, inclusiveWeekTodo } from '/src/store';

const activeListeners = {
  todo: null
}

export function setupTodoListener (uid) {
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
 * 
 * @param {Array} tasks - Flat array of todo tasks from Firestore
 */
export function updateTodoTasks(tasks) {
  if (!tasks || !Array.isArray(tasks)) {
    return;
  }
  
  // Update todo tasks directly in the store
  todoTasks.set(tasks);
  
  // Update the memory tree
  const memoryTree = reconstructTreeInMemory(tasks);
  todoMemoryTree.set(memoryTree);
  inclusiveWeekTodo.set(memoryTree);
}

/**
 * Finds a task by ID from the todo tasks
 * 
 * @param {string} taskID - Task ID to find
 * @returns {Object|null} - The found task or null
 */
export function findTodoTaskById(taskID) {
  const allTodoTasks = get(todoTasks);
  return allTodoTasks.find(task => task.id === taskID);
}

/**
 * Updates a todo task
 * 
 * @param {Object} params - Update parameters
 * @param {string} params.uid - User ID
 * @param {string} params.taskID - Task ID to update
 * @param {Object} params.keyValueChanges - Changes to apply to the task
 * @returns {Promise<Object>} - Information about the update
 */
export async function updateTodoTask({ uid, taskID, keyValueChanges }) {
  try {
    // Find the task in the store
    const task = findTodoTaskById(taskID);
    
    if (!task) {
      console.warn(`Task ${taskID} not found in todo store, falling back to direct database update`);
      // Fall back to direct database update if task not found in store
      await Tasks.updateTaskDoc({ userUID: uid, taskID, keyValueChanges });
      return {
        taskID,
        changes: keyValueChanges
      };
    }
    
    // If the task is being scheduled (startDateISO is being set), we need to handle rootStartDateISO
    if (keyValueChanges.startDateISO && keyValueChanges.startDateISO !== "") {
      let rootStartDateISO = keyValueChanges.startDateISO;
      
      // If this is not a root task, we need to find the parent's rootStartDateISO
      if (task.parentID && task.parentID !== "") {
        const parent = findTodoTaskById(task.parentID);
        if (parent && parent.rootStartDateISO) {
          rootStartDateISO = parent.rootStartDateISO;
        }
      }
      
      // Add rootStartDateISO to the changes
      keyValueChanges.rootStartDateISO = rootStartDateISO;
    }
    
    // Update the task in the database
    await Tasks.updateTaskDoc({ userUID: uid, taskID, keyValueChanges });
    
    // Return information about what changed
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
  cleanupTodoListener
}