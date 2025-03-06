import {
  createOnLocalState,
  updateLocalState,
  deleteFromLocalState,
} from "/src/helpers/maintainState.js"
import { deleteImage } from '/src/helpers/storage.js'
import Tasks from "/src/back-end/Tasks.js"
import { get } from 'svelte/store'
import { user, calendarTasks, todoTasks } from '/src/store/index.js'
import TaskSchema from '/src/back-end/Schemas/TaskSchema.js'

export async function createTaskNode({ id, newTaskObj }) {
  try {
    // strips unknown fields, instantiate missing fields, apply defaults to all fields
    const validatedTask = TaskSchema.parse(newTaskObj)
    Tasks.post({ userUID: get(user).uid, task: validatedTask, taskID: id })
    createOnLocalState({ id, createdNode: validatedTask })
  } catch (error) {
    console.error('Error creating task:', error)
    alert('Error creating task: ' + error.message)
    return error;
  }
}

export async function updateTaskNode({ id, keyValueChanges }) {
  try {
    // discard fields changes that aren't defined in the schema
    const validatedChanges = TaskSchema.partial().parse(keyValueChanges)
    Tasks.update({ userUID: get(user).uid, taskID: id, keyValueChanges:validatedChanges })
    updateLocalState({ id, keyValueChanges: validatedChanges })
  } catch (error) {
    alert(
      "error attempting to save changes to the db, please reload "
    );
    console.error("error in updateTaskNode: ", error);
  }
}

export function deleteTaskNode({ id, imageFullPath = "" }) {
  Tasks.remove({ userUID: get(user).uid, taskID: id })
  if (imageFullPath) deleteImage({ imageFullPath })
  const affectedTasks = [...get(todoTasks).filter(task => task.parentID === id), ...get(calendarTasks).filter(task => task.parentID === id)]
  affectedTasks.forEach(task => updateLocalState({ id: task.id, keyValueChanges: { parentID: "" } }))
  deleteFromLocalState({ id });
}

export async function deleteTaskAndChildren(task) {
  try {
    const allTasks = get(todoTasks);
    const tasksToDelete = [];
    
    function findChildren(parentID) {
      allTasks.forEach(task => {
        if (task.parentID === parentID) {
          tasksToDelete.push(task);
          findChildren(task.id); // Recursively find children
        }
      });
    }

    tasksToDelete.push(task);
    findChildren(task.id);
    
    tasksToDelete.forEach(task => {
      console.log(task)
      if(task.imageFullPath) deleteImage({ imageFullPath: task.imageFullPath })
      deleteFromLocalState({id: task.id});
      Tasks.remove({ userUID: get(user).uid, taskID: task.id })
    })
    
    return true;
  } catch (error) {
    console.error('Error in deleteTaskAndChildren:', error);
    throw error;
  }
}