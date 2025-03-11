import { get } from "svelte/store"
import { calendarTasks, todoTasks } from '/src/store'
import CalendarService from '/src/store/services/CalendarService.js'
import TodoService from '/src/store/services/TodoService.js'

/**
 * Task Management Module
 * 
 * This module provides high-level functions for managing tasks,
 * delegating the actual implementation to specialized services.
 */

// Helper function to find a task by ID from the stores
export function findTaskById(taskID) {
  // Check todoTasks first
  const todoTask = TodoService.findTodoTaskById(taskID);
  if (todoTask) return todoTask;
  
  // Then check calendarTasks
  const calendarTask = CalendarService.tasksCache.get(taskID);
  if (calendarTask) return calendarTask;
  
  // Task not found
  return null;
}

// Client-side function to update a task and handle descendant updates
export async function updateTask({ uid, taskID, keyValueChanges }) {
  try {
    // Find the task in the stores to determine which service to use
    const task = findTaskById(taskID);
    
    if (!task) {
      console.warn(`Task ${taskID} not found in stores, falling back to direct database update`);
      // If we can't find the task, we don't know which service to use
      // So we'll just update the task directly in the database
      const allCalendarTasks = get(calendarTasks);
      const allTodoTasks = get(todoTasks);
      
      // If the task has a startDateISO, it's likely a calendar task
      if (keyValueChanges.startDateISO && keyValueChanges.startDateISO !== "") {
        return CalendarService.updateCalendarTask({ uid, taskID, keyValueChanges });
      } else {
        return TodoService.updateTodoTask({ uid, taskID, keyValueChanges });
      }
    }
    
    // Determine which service to use based on the task's current state
    // and the changes being made
    const isMovingToCalendar = !task.startDateISO && keyValueChanges.startDateISO && keyValueChanges.startDateISO !== "";
    const isMovingToTodo = task.startDateISO && keyValueChanges.startDateISO === "";
    
    if (isMovingToCalendar || (task.startDateISO && !isMovingToTodo)) {
      // This is a calendar task or is becoming one
      return CalendarService.updateCalendarTask({ uid, taskID, keyValueChanges });
    } else {
      // This is a todo task or is becoming one
      return TodoService.updateTodoTask({ uid, taskID, keyValueChanges });
    }
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}


