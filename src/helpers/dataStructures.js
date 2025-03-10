/**
 * Task Tree Utilities
 * 
 * This module contains generic utilities for working with task trees.
 * Calendar-specific functions have been moved to CalendarService.js.
 */

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
 * Recursively hydrates children for a node
 * 
 * @param {Object} node - The node to hydrate children for
 * @param {Object} memo - Mapping of parent IDs to arrays of children
 */
function recursivelyHydrateChildren(node, memo) {
  node.children = memo[node.id] || [];
  for (const child of node.children) {
    recursivelyHydrateChildren(child, memo);
  }
}

/**
 * Finds a task by ID in a collection of tasks
 * 
 * @param {string} taskID - The ID of the task to find
 * @param {Array} tasks - Array of tasks to search
 * @returns {Object|null} - The found task or null
 */
export function findTaskById(taskID, tasks) {
  if (!taskID || !tasks || !Array.isArray(tasks)) {
    return null;
  }
  
  // Direct search
  const task = tasks.find(t => t.id === taskID);
  if (task) return task;
  
  // Search in children
  for (const parentTask of tasks) {
    if (parentTask.children && Array.isArray(parentTask.children)) {
      const childTask = findTaskById(taskID, parentTask.children);
      if (childTask) return childTask;
    }
  }
  
  return null;
}
