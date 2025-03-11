
import { deleteImage } from '/src/helpers/storage.js'
import Tasks from "/src/back-end/Tasks.js"
import { get } from 'svelte/store'
import { user, calendarTasks, todoTasks } from '/src/store/index.js'
import TaskSchema from '/src/back-end/Schemas/TaskSchema.js'
import { updateTask } from '/src/lib/MainPage/handleTasks.js'

/**
 * Creates a new task node
 * @param {string} params.id - The task ID
 * @param {Object} params.newTaskObj - The new task object
 */
export async function createTaskNode ({ id, newTaskObj }) {
  try {
    const validatedTask = TaskSchema.parse(newTaskObj) // strips unknown fields, instantiate missing fields, apply defaults to all fields
    Tasks.post({ userUID: get(user).uid, task: validatedTask, taskID: id })
  } catch (error) {
    console.error('Error creating task:', error)
    alert('Error creating task: ' + error.message)
    return error;
  }
}

/**
 * Updates a task node and its descendants if needed
 * @param {string} params.id - The task ID
 * @param {Object} params.keyValueChanges - The changes to apply
 */
export async function updateTaskNode ({ id, keyValueChanges }) {
  try {
    // discard fields changes that aren't defined in the schema
    const validatedChanges = TaskSchema.partial().parse(keyValueChanges)
    
    // Use the updateTask function that handles descendant updates
    await updateTask({ 
      uid: get(user).uid, 
      taskID: id, 
      keyValueChanges: validatedChanges 
    })
  } catch (error) {
    alert(
      "error attempting to save changes to the db, please reload "
    );
    console.error("error in updateTaskNode: ", error);
  }
}

/**
 * Deletes a task node
 * @param {string} params.id - The task ID
 * @param {string} [params.imageFullPath] - The image path to delete
 */
export function deleteTaskNode ({ id, imageFullPath = "" }) {
  Tasks.remove({ userUID: get(user).uid, taskID: id })
  if (imageFullPath) deleteImage({ imageFullPath })
  
  // Get affected tasks that have this task as parent
  const affectedTasks = [...get(todoTasks).filter(task => task.parentID === id), 
                         ...get(calendarTasks).filter(task => task.parentID === id)]
  
  affectedTasks.forEach(task => {
    Tasks.updateTaskDoc({ 
      userUID: get(user).uid, 
      taskID: task.id, 
      keyValueChanges: { parentID: "" } 
    })
  })
}

export async function deleteTaskAndChildren(task) {
  try {
    const allTasks = get(todoTasks)
    const tasksToDelete = []
    
    function findChildren(parentID) {
      allTasks.forEach(task => {
        if (task.parentID === parentID) {
          tasksToDelete.push(task)
          findChildren(task.id) // Recursively find children
        }
      })
    }

    tasksToDelete.push(task)
    findChildren(task.id)
    
    tasksToDelete.forEach(task => {
      if(task.imageFullPath) deleteImage({ imageFullPath: task.imageFullPath })
      Tasks.remove({ userUID: get(user).uid, taskID: task.id })
    })
    
    return true
  } catch (error) {
    console.error('Error in deleteTaskAndChildren:', error);
    throw error
  }
}