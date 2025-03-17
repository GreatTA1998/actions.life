import { deleteImage } from '/src/helpers/storage.js'
import { get } from 'svelte/store'
import { user, tasksCache } from '/src/store/index.js'
import TaskSchema from '/src/back-end/Schemas/TaskSchema.js'
import { writeBatch } from 'firebase/firestore'
import { db } from '/src/back-end/firestoreConnection'
import { maintainTreeISOs, getRoot, listTreeNodes, removeOneInstance, handleCreateForTreeISOs } from '/src/store/services/treeISOs.js'
import { doc } from 'firebase/firestore'

export async function createTaskNode ({ id, newTaskObj }) {
  try {
    const batch = writeBatch(db)
    const validatedTask = TaskSchema.parse({ ...newTaskObj })

    const treeISOs = handleCreateForTreeISOs({ id, newTaskObj: validatedTask, batch })
    batch.set(doc(db, `users/${get(user).uid}/tasks/${id}`), { 
      treeISOs,
      ...validatedTask
    })

    batch.commit()
  } 
  catch (error) {
    console.error('Error creating task:', error)
    alert('Error creating task: ' + error.message)
    return error
  }
}

export async function updateTaskNode ({ id, keyValueChanges }) {
  try {
    const validatedChanges = TaskSchema.partial().parse(keyValueChanges)
    const batch = writeBatch(db)
    maintainTreeISOs({ id, keyValueChanges: validatedChanges, batch })
    batch.update(doc(db, `users/${get(user).uid}/tasks/${id}`), validatedChanges)

    batch.commit()
  }
  catch (error) {
    alert("Error saving changes to db, please reload");
    console.error("Error in updateTaskNode: ", error);
  }
}

export async function deleteTaskNode ({ id, imageFullPath = "" }) {
  const batch = writeBatch(db)
  const task = get(tasksCache)[id]
  
  await deleteTaskAndChildren(task, batch)
  
  if (imageFullPath) deleteImage({ imageFullPath })
  
  await batch.commit()
}

export async function deleteTaskAndChildren (task, existingBatch) {
  try {
    const uid = get(user).uid
    const batch = existingBatch || writeBatch(db)
    const tasksToDelete = []
    
    function findChildren(parentID) {
      Object.values(get(tasksCache)).forEach(t => {
        if (t.parentID === parentID) {
          tasksToDelete.push(t)
          findChildren(t.id)
        }
      })
    }

    tasksToDelete.push(task)
    findChildren(task.id)
    
    // Get all dates from tasks being deleted
    const datesToRemove = tasksToDelete
      .filter(t => t.startDateISO)
      .map(t => t.startDateISO)
    
    // Update the parent tree if task has a parent - do this in a single operation
    if (task.parentID && datesToRemove.length > 0) {
      const parentTask = get(tasksCache)[task.parentID]
      if (parentTask) {
        const rootTask = getRoot(parentTask)
        const allTreeTasks = listTreeNodes(rootTask.id)
        
        // Remove exactly one instance of each date from the tree's treeISOs
        let updatedTreeISOs = [...(rootTask.treeISOs || [])]
        for (const date of datesToRemove) {
          updatedTreeISOs = removeOneInstance(updatedTreeISOs, date)
        }
        
        // Update all tasks in the tree with the new treeISOs in a single batch
        for (const treeTask of allTreeTasks) {
          // Skip tasks that are being deleted
          if (!tasksToDelete.some(t => t.id === treeTask.id)) {
            const taskRef = doc(db, 'users', uid, 'tasks', treeTask.id)
            batch.update(taskRef, { treeISOs: updatedTreeISOs })
          }
        }
      }
    }
    
    // Delete all tasks in the same batch
    for (const taskToDelete of tasksToDelete) {
      if (taskToDelete.imageFullPath) {
        deleteImage({ imageFullPath: taskToDelete.imageFullPath })
      }
      batch.delete(doc(db, 'users', uid, 'tasks', taskToDelete.id))
    }
    
    if (!existingBatch) {
      await batch.commit()
    }
    
    return true
  } catch (error) {
    console.error('Error in deleteTaskAndChildren:', error)
    throw error
  }
}