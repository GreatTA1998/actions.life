import { writable } from 'svelte/store'

/**
 * Calendar Store
 * 
 * This module defines Svelte stores for calendar-related data.
 * The actual logic for updating these stores is in services/CalendarService.js.
 */

// Store for flat array of calendar tasks from Firestore
export const calendarTasks = writable([])

// Store for tasks organized by date
export const tasksScheduledOn = writable({}) 