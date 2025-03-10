import { DateTime } from "luxon"
import { constructCalendarTrees, computeDateToTasksDict } from "/src/helpers/dataStructures.js"
import Tasks from "/src/back-end/Tasks"
import { size, cushion } from '/src/helpers/constants.js'
import { get } from "svelte/store"
import { calendarTasks, todoTasks, calendarMemoryTree, todoMemoryTree, tasksScheduledOn, inclusiveWeekTodo, uniqueEvents, loadingTasks, user } from '/src/store'
import { doc, writeBatch } from "firebase/firestore"
import { db } from "/src/back-end/firestoreConnection"

// Store active listeners to manage them
const activeListeners = {
  calendar: {},
  todo: null
};

// Helper function to find a task by ID from the stores
export function findTaskById(taskID) {
  // Check todoTasks first
  const todoTask = get(todoTasks).find(task => task.id === taskID);
  if (todoTask) return todoTask;
  
  // Then check calendarTasks
  const calendarTask = get(calendarTasks).find(task => task.id === taskID);
  if (calendarTask) return calendarTask;
  
  // Task not found
  return null;
}

// Helper to generate a unique key for a date range
function getDateRangeKey(leftDate, rightDate) {
  return `${leftDate.toFormat("yyyy-MM-dd")}_${rightDate.toFormat("yyyy-MM-dd")}`;
}

export function handleInitialTasks(uid) {
  loadingTasks.set(true);
  const today = DateTime.now();
  const left = today.minus({ days: size + cushion });
  const right = today.plus({ days: size + cushion });
  
  // Set up listeners for both calendar and todo tasks
  setupCalendarListener(uid, left, right);
  setupTodoListener(uid);
  
  loadingTasks.set(false);
}

// Client-side function to update a task and handle descendant updates
export async function updateTask({ uid, taskID, keyValueChanges }) {
  try {
    // Find the task in the stores
    const task = findTaskById(taskID);
    
    if (!task) {
      console.warn(`Task ${taskID} not found in stores, falling back to direct database update`);
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
        const newParent = findTaskById(keyValueChanges.parentID);
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
        // The recursive solution will naturally handle the case where there are no children
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
    console.error("Error updating task:", error);
    throw error;
  }
}

// Helper function to update rootStartDateISO for all descendants
async function updateDescendantsRootStartDateISO(uid, taskID, rootStartDateISO) {
  // Get all tasks from the stores
  const allTasks = [...get(todoTasks), ...get(calendarTasks)];
  
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

// Set up a listener for calendar tasks in a specific date range
function setupCalendarListener(uid, leftDate, rightDate) {
  const rangeKey = getDateRangeKey(leftDate, rightDate);
  
  // If we already have a listener for this range, don't create another one
  if (activeListeners.calendar[rangeKey]) {
    return;
  }
  
  // Set up listener for tasks in this date range
  activeListeners.calendar[rangeKey] = Tasks.listenToDateRange(
    uid,
    leftDate.toFormat("yyyy-MM-dd"),
    rightDate.toFormat("yyyy-MM-dd"),
    updateCalendarWithNewTasks
  );
}

// Set up a listener for todo tasks
function setupTodoListener(uid) {
  // If we already have a listener, don't create another one
  if (activeListeners.todo) {
    return;
  }
  
  activeListeners.todo = Tasks.listenToUnscheduled(
    uid,
    (tasks) => {
      // Update todo tasks directly in the store
      todoTasks.set(tasks);
      
      // Update the memory tree
      const memoryTree = reconstructTreeInMemory(tasks);
      todoMemoryTree.set(memoryTree);
      inclusiveWeekTodo.set(memoryTree);
    }
  );
}

// Helper function to reconstruct the tree in memory
function reconstructTreeInMemory(tasks) {
  // This is a simplified version of the function from dataStructures.js
  // We're including it here to avoid dependencies on maintainState.js
  const output = [];
  
  // Build a dictionary that maps a task to its children
  const memo = { "": [] };
  for (const task of tasks) {
    if (!memo[task.parentID]) memo[task.parentID] = [];
    memo[task.parentID].push(task);
    
    if (!memo[task.id]) memo[task.id] = [];
  }
  
  // Construct the recursive tree
  const rootTasks = memo[""] || [];
  for (const rootTask of rootTasks) {
    recursivelyHydrateChildren(rootTask, memo);
    output.push(rootTask);
  }
  
  return output;
}

// Helper function to recursively hydrate children
function recursivelyHydrateChildren(node, memo) {
  node.children = memo[node.id] || [];
  for (const child of node.children) {
    recursivelyHydrateChildren(child, memo);
  }
}

// Helper function to update calendar with new tasks from listeners
function updateCalendarWithNewTasks(newTasks) {
  // Get current tasks and merge with new ones, removing duplicates
  const currentTasks = get(calendarTasks) || [];
  const mergedTasks = removeDuplicateTasks([...currentTasks, ...newTasks]);
  
  // Update the calendar tasks store directly
  calendarTasks.set(mergedTasks);
  
  // Update the memory tree
  const memoryTree = constructCalendarTrees(mergedTasks);
  calendarMemoryTree.set(memoryTree);
  
  // Update the tasks scheduled on dictionary
  const dateToTasks = computeDateToTasksDict(memoryTree);
  tasksScheduledOn.set(dateToTasks);
}

// Helper function to remove duplicate tasks by ID
function removeDuplicateTasks(tasks) {
  return tasks.filter(
    (task, index, self) => index === self.findIndex((t) => t.id === task.id)
  );
}

// Clean up listeners when they're no longer needed
export function cleanupListeners() {
  // Clean up calendar listeners
  Object.values(activeListeners.calendar).forEach(unsubscribe => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });
  activeListeners.calendar = {};
  
  // Clean up todo listener
  if (activeListeners.todo) {
    activeListeners.todo();
    activeListeners.todo = null;
  }
}

export async function fetchMobileCalTasks(uid) {
  const today = DateTime.now();
  const leftDate = today.minus({ days: 7 });
  const rightDate = today.plus({ days: 7 });
  
  setupCalendarListener(uid, leftDate, rightDate);
  return Promise.resolve(); // Return a resolved promise for compatibility
}

export async function fetchMobileTodoTasks(uid) {
  setupTodoListener(uid);
}

// NOTE: mobile fetches will merge and build upon existing fetched data
export async function fetchMobileFutureOverviewTasks(uid, hideRoutines = false) {
  const today = DateTime.now();
  const futureDate = today.plus({ years: 2 });
  
  // Set up a special listener for future events
  const rangeKey = getDateRangeKey(today, futureDate);
  
  if (activeListeners.calendar[rangeKey]) {
    return;
  }
  
  activeListeners.calendar[rangeKey] = Tasks.getByDateRangeWithListener(
    uid,
    today.toFormat("yyyy-MM-dd"),
    futureDate.toFormat("yyyy-MM-dd"),
    (tasks) => {
      let filteredTasks = tasks;
      if (hideRoutines) {
        filteredTasks = tasks.filter(task => task.templateID === "");
      }
      
      // Update the unique events store directly
      // This is a simplified version of buildEventsDataStructures
      const memoryTree = constructCalendarTrees(filteredTasks);
      const dateToTasks = computeDateToTasksDict(memoryTree);
      uniqueEvents.set(dateToTasks);
    }
  );
}

/**
 * Sets up a listener for tasks in a specific date range
 * @param {string} uid - User ID
 * @param {DateTime} triggerDT - The trigger date (used for determining the range)
 * @param {DateTime} startDate - The start date of the range
 * @param {DateTime} endDate - The end date of the range
 * @returns {Function} Unsubscribe function
 */
export function setupTasksRangeListener(uid, triggerDT, startDate, endDate) {
  return setupCalendarListener(uid, startDate, endDate);
}

// Console-based migration function that can be called from the browser console
export function initializeConsoleMigration() {
  // Make the migration function available globally
  window.migrateToRootStartDateISO = async () => {
    const currentUser = get(user);
    if (!currentUser || !currentUser.uid) {
      console.error('No user logged in. Please log in first.');
      return;
    }
    
    console.log('Starting migration to rootStartDateISO...');
    try {
      const result = await Tasks.migrateToRootStartDateISO(currentUser.uid);
      if (result.success) {
        console.log('Migration completed successfully!');
        console.log(result.message);
      } else {
        console.error('Migration failed:', result.error);
      }
    } catch (error) {
      console.error('Error during migration:', error);
    }
  };
  
  // Add instructions to the console
  console.log(
    '%c rootStartDateISO Migration Tool Available',
    'background: #4CAF50; color: white; padding: 4px; border-radius: 4px;'
  );
  console.log(
    'To migrate your tasks to use rootStartDateISO, run: %cwindow.migrateToRootStartDateISO()',
    'font-weight: bold; color: #2196F3;'
  );
}


