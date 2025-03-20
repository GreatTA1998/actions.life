import { deleteImage } from '/src/db/helpers.js'
import { get } from 'svelte/store'
import { user, tasksCache } from '/src/store/index.js'
import { Task } from '../db/schemas'
import { writeBatch } from 'firebase/firestore'
import { db } from '/src/db/init'
import { 
  maintainTreeISOs, 
  maintainTreeISOsForCreate,
  handleTreeISOsForDeletion
} from '/src/db/treeISOs.js'
import { doc } from 'firebase/firestore'

export async function createTaskNode ({ id, newTaskObj }) {
  try {
    const batch = writeBatch(db)
    const validatedTask = Task.parse({ ...newTaskObj })
    const treeISOs = maintainTreeISOsForCreate({ task: validatedTask, batch })
    
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
    const validatedChanges = Task.partial().parse(keyValueChanges)
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

export async function deleteTaskNode ({ id }) {
  const task = get(tasksCache)[id]

  const tasksToDelete = [task]
  pushDescendants(task.id, tasksToDelete)

  if (tasksToDelete.length >= 2) {
    if (!confirm(`${tasksToDelete.length} tasks will be deleted in this tree. Are you sure?`)) {
      return
    }
  }

  const { uid } = get(user)
  const batch = writeBatch(db)

  for (const task of tasksToDelete) {
    const { imageFullPath, id } = task
    if (imageFullPath) deleteImage({ imageFullPath })
    batch.delete(doc(db, `/users/${uid}/tasks/${id}`))
  }
  handleTreeISOsForDeletion({ tasksToDelete, batch })

  await batch.commit()
  return tasksToDelete
}

function pushDescendants (parentID, tasksToDelete) {
  Object.values(get(tasksCache)).forEach(t => {
    if (t.parentID === parentID) {
      tasksToDelete.push(t)
      pushDescendants(t.id, tasksToDelete)
    }
  })
}