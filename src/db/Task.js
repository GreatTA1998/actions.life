import { z } from 'zod'
import { deleteImage } from './helpers.js'
import { get } from 'svelte/store'
import { user, tasksCache } from '/src/store/index.js'
import { writeBatch } from 'firebase/firestore'
import { db } from './init'
import { maintainTreeISOs, maintainTreeISOsForCreate, handleTreeISOsForDeletion } from './treeISOs.js'
import { doc } from 'firebase/firestore'

const Task = {
  schema: z.object({
    name: z.string().default('Untitled'),
    duration: z.number().default(30),
    orderValue: z.number().default(0.1),
    parentID: z.string().default(''),
    startTime: z.string().default(''),
    startDateISO: z.string().default(''),
    iconURL: z.string().default(''),
    timeZone: z.string().default(Intl.DateTimeFormat().resolvedOptions().timeZone),
    notify: z.string().default(''),
    notes: z.string().default(''),
    templateID: z.string().default(''),
    isDone: z.boolean().default(false),
    imageDownloadURL: z.string().default(''),
    imageFullPath: z.string().default(''),
    tags: z.string().default(''),
    isArchived: z.boolean().default(false),
    persistsOnList: z.boolean().default(true),
    listID: z.string().default(''),
    childrenLayout: z.string().default('normal'), // 'normal' or 'timeline'

    treeISOs: z.array(z.string()).optional() // must be computed & maintained
  }),

  async create ({ id, newTaskObj }) {
    try {
      const batch = writeBatch(db)
      const validatedTask = Task.schema.parse({ ...newTaskObj })
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
  },

  async update ({ id, keyValueChanges }) {
    try {
      const validatedChanges = Task.schema.partial().parse(keyValueChanges)
      const batch = writeBatch(db)
      maintainTreeISOs({ id, keyValueChanges: validatedChanges, batch })
      batch.update(doc(db, `users/${get(user).uid}/tasks/${id}`), validatedChanges)

      batch.commit()
    }
    catch (error) {
      alert("Error saving changes to db, please reload")
      console.error("Error in Task.update: ", error)
    }
  },

  async delete ({ id }) {
    const taskObj = get(tasksCache)[id]

    const tasksToDelete = [taskObj]
    pushDescendants(taskObj.id, tasksToDelete)

    if (tasksToDelete.length >= 2) {
      if (!confirm(`${tasksToDelete.length} tasks will be deleted in this tree. Are you sure?`)) {
        return
      }
    }

    const { uid } = get(user)
    const batch = writeBatch(db)

    for (const taskObj of tasksToDelete) {
      const { imageFullPath, id } = taskObj
      if (imageFullPath) deleteImage({ imageFullPath })
      batch.delete(doc(db, `/users/${uid}/tasks/${id}`))
    }
    handleTreeISOsForDeletion({ tasksToDelete, batch })

    await batch.commit()
    return tasksToDelete
  }
}

function pushDescendants (parentID, tasksToDelete) {
  Object.values(get(tasksCache)).forEach(t => {
    if (t.parentID === parentID) {
      tasksToDelete.push(t)
      pushDescendants(t.id, tasksToDelete)
    }
  })
} 

export default Task