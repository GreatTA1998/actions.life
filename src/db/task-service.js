import Task from './Task.js'

// Re-export with original names for backwards compatibility
export const createTaskNode = (params) => Task.create(params)
export const updateTaskNode = (params) => Task.update(params)
export const deleteTaskNode = (params) => Task.delete(params)

// Add deprecation warnings in development
if (process.env.NODE_ENV !== 'production') {
  console.warn('task-service.js is deprecated. Import from /src/db/Task.js instead.')
}