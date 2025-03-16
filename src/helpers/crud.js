import { deleteImage } from '/src/helpers/storage.js'
import Tasks from "/src/back-end/Tasks.js"
import { get } from 'svelte/store'
import { user, calendarTasks, todoTasks, tasksCache } from '/src/store/index.js'
import TaskSchema from '/src/back-end/Schemas/TaskSchema.js'
import { updateTask } from '/src/lib/MainPage/handleTasks.js'

export async function createTaskNode ({ id, newTaskObj }) {
  try {
    const { parentID, startDateISO } = newTaskObj

    const treeISOs = parentID ? (get(tasksCache)[parentID].treeISOs || []) : [] // || [] is necessary because we have legacy schemas
    if (startDateISO) treeISOs.push(startDateISO)

    const validatedTask = TaskSchema.parse({
      ...newTaskObj,
      treeISOs
    })
    
    Tasks.post({ 
      userUID: get(user).uid, 
      task: validatedTask, 
      taskID: id 
    })
  } catch (error) {
    console.error('Error creating task:', error)
    alert('Error creating task: ' + error.message)
    return error;
  }
}

/** Updates a task node and its descendants if needed */
export async function updateTaskNode ({ id, keyValueChanges }) {
  try {
    // discard fields changes that aren't defined in the schema
    const validatedChanges = TaskSchema.partial().parse(keyValueChanges)
    
    // Use the updateTask function that handles descendant updates
    updateTask({ 
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