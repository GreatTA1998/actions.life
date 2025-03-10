import { DateTime } from "luxon";
import Tasks from "/src/back-end/Tasks";
import { pureNumericalHourForm } from "/src/helpers/everythingElse.js";
import { get } from "svelte/store";
import { calendarTasks, tasksScheduledOn } from '../calendarStore.js';
import { doc, writeBatch } from "firebase/firestore";
import { db } from "/src/back-end/firestoreConnection";
import { size, cushion } from '/src/helpers/constants.js';

const activeListeners = {
  calendar: {}
};

// Cache for date range keys to avoid string operations
const dateRangeKeyCache = new Map();

/**
 * Helper to generate a unique key for a date range
 * Uses caching to avoid string operations
 * 
 * @param {DateTime} leftDate - Start date of the range
 * @param {DateTime} rightDate - End date of the range
 * @returns {string} - Unique key for the date range
 */
function getDateRangeKey(leftDate, rightDate) {
  const leftStr = leftDate.toFormat("yyyy-MM-dd");
  const rightStr = rightDate.toFormat("yyyy-MM-dd");
  const key = `${leftStr}_${rightStr}`;
  
  if (!dateRangeKeyCache.has(key)) {
    dateRangeKeyCache.set(key, key);
  }
  return dateRangeKeyCache.get(key);
}

/**
 * Constructs calendar task trees from flat Firestore task documents
 * 
 * @param {Array} firestoreTaskDocs - All necessary tasks to reconstruct 
 *                                    scheduled tasks and their subtrees
 * @returns {Array} - Array of task trees where each root has a startDateISO
 */
function constructCalendarTrees(firestoreTaskDocs) {
  const cache = new Map();
  
  // Build task map and connect parent-child relationships
  const taskMap = new Map();
  firestoreTaskDocs.forEach(task => {
    taskMap.set(task.id, { ...task, children: [] });
  });
  
  // Identify root tasks (those without parents or with parents not in our dataset)
  const rootTasks = [];
  taskMap.forEach(task => {
    if (!task.parentID || !taskMap.has(task.parentID)) {
      rootTasks.push(task);
    } else {
      const parent = taskMap.get(task.parentID);
      parent.children.push(task);
    }
  });
  
  // Every scheduled node is a calendar entry, with its full subtree
  const output = [];
  firestoreTaskDocs.forEach(task => {
    if (task.startDateISO) {
      const taskTree = deepCopyWithSubtree(task, taskMap, cache);
      output.push(taskTree);
    }
  });
  
  return output;
}

/**
 * Creates a deep copy of a task with its entire subtree
 * 
 * @param {Object} task - The task to copy
 * @param {Map} taskMap - Map of all tasks by ID
 * @param {Map} cache - Cache to avoid duplicate processing
 * @returns {Object} - Deep copy of the task with its subtree
 */
function deepCopyWithSubtree(task, taskMap, cache) {
  // Use cached result if available
  if (cache.has(task.id)) {
    return cache.get(task.id);
  }
  
  // Create a new root node
  const rootNode = { ...task, children: [] };
  cache.set(task.id, rootNode);
  
  // Find and process all children
  const children = [];
  taskMap.forEach(potentialChild => {
    if (potentialChild.parentID === task.id) {
      const childTree = deepCopyWithSubtree(potentialChild, taskMap, cache);
      children.push(childTree);
    }
  });
  
  rootNode.children = children;
  return rootNode;
}

/**
 * Computes a dictionary mapping dates to tasks
 * 
 * @param {Array} taskTrees - Array of task trees
 * @returns {Object} - Dictionary mapping dates to task structures
 */
function computeDateToTasksDict(taskTrees) {
  const dateToTasks = {};
  
  // All tasks in taskTrees already have startDateISO, so no need to check again
  taskTrees.forEach(task => {
    addTaskToDate(task, task.startDateISO, dateToTasks);
  });
  
  // Sort tasks with startTime for predictable drag behavior
  for (const [key, value] of Object.entries(dateToTasks)) {
    if (value.hasStartTime && value.hasStartTime.length > 0) {
      value.hasStartTime = value.hasStartTime.sort((a, b) => {
        return pureNumericalHourForm(a.startTime) - pureNumericalHourForm(b.startTime);
      });
    }
  }
  
  return dateToTasks;
}

/**
 * Adds a task to the appropriate category in the date-to-tasks dictionary
 * 
 * @param {Object} task - The task to add
 * @param {string} date - The date to add the task to
 * @param {Object} dateToTasks - The date-to-tasks dictionary to modify
 */
function addTaskToDate(task, date, dateToTasks) {
  // Initialize the structure for this date if it doesn't exist
  if (!dateToTasks[date]) {
    dateToTasks[date] = { 
      hasStartTime: [], 
      noStartTime: { 
        hasIcon: [], 
        noIcon: [] 
      } 
    };
  }
  
  // Add the task to the appropriate category
  if (task.startTime) {
    dateToTasks[date].hasStartTime.push(task);
  } else if (task.iconName || task.iconURL) {
    dateToTasks[date].noStartTime.hasIcon.push(task);
  } else {
    dateToTasks[date].noStartTime.noIcon.push(task);
  }
}

/**
 * Sets up initial calendar tasks for the main view
 * 
 * @param {string} uid - User ID
 * @returns {void}
 */
export function setupInitialCalendarTasks(uid) {
  const today = DateTime.now();
  const left = today.minus({ days: size + cushion });
  const right = today.plus({ days: size + cushion });
  
  setupCalListener(uid, left, right);
}

/**
 * Sets up calendar tasks for mobile view
 * 
 * @param {string} uid - User ID
 * @returns {Promise<void>}
 */
export async function setupMobileCalendarTasks(uid) {
  const today = DateTime.now();
  const leftDate = today.minus({ days: 7 });
  const rightDate = today.plus({ days: 7 });
  
  setupCalListener(uid, leftDate, rightDate);
  return Promise.resolve();
}

/**
 * Sets up future overview tasks for mobile view
 * 
 * @param {string} uid - User ID
 * @param {boolean} hideRoutines - Whether to hide routine tasks
 * @returns {void}
 */
export function setupFutureOverviewTasks(uid, hideRoutines = false) {
  const today = DateTime.now().startOf('day');
  const futureDate = today.plus({ days: 30 });
  
  // Set up a one-time listener for this range
  Tasks.listenToDateRange(
    uid,
    today.toFormat("yyyy-MM-dd"),
    futureDate.toFormat("yyyy-MM-dd"),
    (tasks) => {
      let filteredTasks = tasks;
      if (hideRoutines) {
        filteredTasks = tasks.filter(task => task.templateID === "");
      }
      
      // Process the tasks and update the stores
      updateTasksForDateRange(
        filteredTasks,
        today.toFormat("yyyy-MM-dd"),
        futureDate.toFormat("yyyy-MM-dd")
      );
    }
  );
}

/**
 * Sets up a listener for calendar tasks in a specific date range
 * 
 * @param {string} uid - User ID
 * @param {DateTime} leftDate - Start date of the range
 * @param {DateTime} rightDate - End date of the range
 */
export function setupCalListener(uid, leftDate, rightDate) {
  const rangeKey = getDateRangeKey(leftDate, rightDate);
  
  // If we already have a listener for this range, don't create another one
  if (activeListeners.calendar[rangeKey]) {
    console.log(`Listener for range ${rangeKey} already exists, skipping`);
    return;
  }
  
  // Set up listener for tasks in this date range
  try {
    activeListeners.calendar[rangeKey] = Tasks.listenToDateRange(
      uid,
      leftDate.toFormat('yyyy-MM-dd'),
      rightDate.toFormat('yyyy-MM-dd'),
      (tasks) => {
        updateTasksForDateRange(
          tasks,
          leftDate.toFormat('yyyy-MM-dd'),
          rightDate.toFormat('yyyy-MM-dd')
        );
      }
    );
  } catch (error) {
    console.error(`Error setting up listener for range ${rangeKey}:`, error);
  }
}

/**
 * Updates tasks for a specific date range
 * 
 * @param {Array} flatArray - Flat array of tasks from Firestore
 * @param {string} startDate - Start date of the range (YYYY-MM-DD)
 * @param {string} endDate - End date of the range (YYYY-MM-DD)
 */
export function updateTasksForDateRange(flatArray, startDate, endDate) {
  if (!flatArray || !Array.isArray(flatArray) || flatArray.length === 0) {
    return;
  }
  
  // Update the calendarTasks store with the flat array
  calendarTasks.set(flatArray);
  
  // Transform the flat array into a tree structure
  const memoryTree = constructCalendarTrees(flatArray);
  
  // Compute the date-to-tasks mapping
  const dateMapping = computeDateToTasksDict(memoryTree);
  
  // Update the tasksScheduledOn store
  tasksScheduledOn.update($tasksScheduledOn => {
    for (const [date, tasks] of Object.entries(dateMapping)) {
      $tasksScheduledOn[date] = tasks;
    }
    return $tasksScheduledOn;
  });
}

/**
 * Finds a task by ID from the calendar tasks
 * 
 * @param {string} taskID - Task ID to find
 * @returns {Object|null} - The found task or null
 */
export function findCalendarTaskById(taskID) {
  const allCalendarTasks = get(calendarTasks);
  return allCalendarTasks.find(task => task.id === taskID);
}

/**
 * Updates a task and handles descendant updates for rootStartDateISO
 * 
 * @param {Object} params - Update parameters
 * @param {string} params.uid - User ID
 * @param {string} params.taskID - Task ID to update
 * @param {Object} params.keyValueChanges - Changes to apply to the task
 * @returns {Promise<Object>} - Information about the update
 */
export async function updateCalendarTask({ uid, taskID, keyValueChanges }) {
  try {
    // Find the task in the stores
    const task = findCalendarTaskById(taskID);
    
    if (!task) {
      console.warn(`Task ${taskID} not found in calendar store, falling back to direct database update`);
      // Fall back to direct database update if task not found in stores
      await Tasks.updateTaskDoc({ userUID: uid, taskID, keyValueChanges });
      return {
        taskID,
        changes: keyValueChanges,
        rootStartDateISOChanged: false
      };
    }
    
    // Determine if we need to update rootStartDateISO
    const isRescheduling = keyValueChanges.startDateISO !== undefined;
    const isReparenting = keyValueChanges.parentID !== undefined;
    let updatedChanges = { ...keyValueChanges };
    
    // Determine the new rootStartDateISO if needed
    if (isRescheduling || isReparenting) {
      let newRootStartDateISO = task.rootStartDateISO;
      
      // If this is a root node being rescheduled, update its rootStartDateISO
      if (isRescheduling && (!task.parentID || task.parentID === "")) {
        newRootStartDateISO = keyValueChanges.startDateISO || "";
      }
      // If this is a node being re-parented, update its rootStartDateISO based on new parent
      else if (isReparenting && keyValueChanges.parentID) {
        const newParent = findCalendarTaskById(keyValueChanges.parentID);
        if (newParent && newParent.rootStartDateISO) {
          newRootStartDateISO = newParent.rootStartDateISO;
        } else if (keyValueChanges.startDateISO) {
          newRootStartDateISO = keyValueChanges.startDateISO;
        }
      }
      // If node is becoming a root node (parentID set to empty), use its own startDateISO
      else if (isReparenting && (!keyValueChanges.parentID || keyValueChanges.parentID === "")) {
        newRootStartDateISO = keyValueChanges.startDateISO || task.startDateISO;
      }
      
      // Add rootStartDateISO to the changes if it's different
      if (newRootStartDateISO !== task.rootStartDateISO) {
        updatedChanges.rootStartDateISO = newRootStartDateISO;
        
        // Update the task in the database
        await Tasks.updateTaskDoc({ userUID: uid, taskID, keyValueChanges: updatedChanges });
        
        // Always update descendants when rootStartDateISO changes
        await updateDescendantsRootStartDateISO(uid, taskID, newRootStartDateISO);
        
        // Return information about what changed
        return {
          taskID,
          changes: updatedChanges,
          rootStartDateISOChanged: true,
          originalTask: task
        };
      }
    }
    
    // If we didn't update rootStartDateISO, just update the task
    await Tasks.updateTaskDoc({ userUID: uid, taskID, keyValueChanges: updatedChanges });
    
    // Return information about what changed
    return {
      taskID,
      changes: updatedChanges,
      rootStartDateISOChanged: false,
      originalTask: task
    };
  } catch (error) {
    console.error("Error updating calendar task:", error);
    throw error;
  }
}

/**
 * Updates rootStartDateISO for all descendants of a task
 * 
 * @param {string} uid - User ID
 * @param {string} taskID - Parent task ID
 * @param {string} rootStartDateISO - New rootStartDateISO value
 * @returns {Promise<void>}
 */
async function updateDescendantsRootStartDateISO(uid, taskID, rootStartDateISO) {
  // Get all tasks from the store
  const allTasks = get(calendarTasks);
  
  // Find direct children of this task
  const children = allTasks.filter(task => task.parentID === taskID);
  
  // If there are no children, we're done (base case for recursion)
  if (children.length === 0) {
    return;
  }
  
  // Create a batch for updating children
  const batch = writeBatch(db);
  
  // Update each child and recursively update their descendants
  const updatePromises = children.map(async child => {
    // Add this child to the batch
    const childRef = doc(db, "users", uid, "tasks", child.id);
    batch.update(childRef, { rootStartDateISO });
    
    // Recursively update this child's descendants
    await updateDescendantsRootStartDateISO(uid, child.id, rootStartDateISO);
  });
  
  // Wait for all recursive updates to complete
  await Promise.all(updatePromises);
  
  // Commit the batch for this level
  await batch.commit();
  console.log(`Updated rootStartDateISO for ${children.length} direct children of task ${taskID}`);
}

/**
 * Cleans up all calendar listeners
 */
export function cleanupCalendarListeners() {
  Object.entries(activeListeners.calendar).forEach(([key, unsubscribe]) => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
      console.log(`Cleaned up calendar listener for range ${key}`);
    }
  });
  
  // Reset the listeners object
  activeListeners.calendar = {};
}

export default {
  setupInitialCalendarTasks,
  setupMobileCalendarTasks,
  setupFutureOverviewTasks,
  setupCalListener,
  updateTasksForDateRange,
  findCalendarTaskById,
  updateCalendarTask,
  cleanupCalendarListeners
}; 