import {
  createOnLocalState,
  updateLocalState,
  deleteFromLocalState,
} from "/src/helpers/maintainState.js"
import { deleteImage } from '/src/helpers/storage.js'
import applyTaskSchema from "/src/helpers/applyTaskSchema.js"
import TaskSchema from "/src/back-end/Schemas/TaskSchema.js"
import Joi from "joi"
import Tasks from "/src/back-end/Tasks.js"
import { get } from 'svelte/store'
import { user, calendarTasks, todoTasks } from '/src/store/index.js'

export async function createTaskNode({ id, newTaskObj }) {
  try {
    const newTaskObjChecked = await applyTaskSchema(newTaskObj, get(user))
    Joi.assert(newTaskObjChecked, TaskSchema)
    Tasks.post({ userUID: get(user).uid, task: newTaskObjChecked, taskID: id })
    createOnLocalState({ id, createdNode: newTaskObjChecked })
  } catch (error) {
    console.error('error creating task node: ', error)
    alert("Database update failed, please reload")
    return error;
  }
}

export async function updateTaskNode({ id, keyValueChanges }) {
  try {
    // TEMPORARILY COMMENT OUT FOR QUICK PROTOTYPING
    // const tasks = get(calendarTasks).concat(get(todoTasks))
    // const task = tasks.find(task => task.id === id);
    // const newTask = removeUnnecessaryFields({ ...task, ...keyValueChanges })
    // Joi.assert(newTask, TaskSchema)
    Tasks.update({ userUID: get(user).uid, taskID: id, keyValueChanges })
    updateLocalState({ id, keyValueChanges });
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


const nesseseryFields = [
  "duration",
  "name",
  "orderValue",
  "parentID",
  "startTime",
  "startDateISO",
  "iconURL",
  "timeZone",
  "notify",
  "notes",
  "templateID",
  "isDone",
  "imageDownloadURL",
  "tags",
  "imageFullPath"];

function removeUnnecessaryFields(task) {
  const cleanedTask = {};
  nesseseryFields.forEach(field => {
    if (task.hasOwnProperty(field)) {
      cleanedTask[field] = task[field];
    }
  });
  return cleanedTask;
};