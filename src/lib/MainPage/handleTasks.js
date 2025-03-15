import { get } from "svelte/store"
import { calendarTasks, todoTasks, tasksCache } from '/src/store'
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
  const calendarTask = get(tasksCache)[taskID]
  if (calendarTask) return calendarTask;
  
  // Task not found
  return null;
}

// Client-side function to update a task and handle descendant updates
export async function updateTask({ uid, taskID, keyValueChanges }) {
  try {
    const task = get(tasksCache)[taskID]
    
    // Determine which service to use based on the task's current state
    // and the changes being made
    const isMovingToCalendar = !task.startDateISO && keyValueChanges.startDateISO && keyValueChanges.startDateISO !== "";
    const isMovingToTodo = task.startDateISO && keyValueChanges.startDateISO === "";
    
    if (isMovingToCalendar || (task.startDateISO && !isMovingToTodo)) {
      return CalendarService.updateCalendarTask({ uid, taskID, keyValueChanges });
    } else {
      return TodoService.updateTodoTask({ uid, taskID, keyValueChanges });
    }
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}


