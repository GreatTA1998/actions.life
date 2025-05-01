import { z } from 'zod'
import { deleteImage } from '$lib/db/helpers.js'
import { get } from 'svelte/store'
import { user, tasksCache } from '$lib/store/index.js'
import { 
  writeBatch, getDocs, increment, 
  collection, query, where, 
  updateDoc, onSnapshot, doc 
} from 'firebase/firestore'
import { db } from '$lib/db/init.js'
import { maintainTreeISOs, maintainTreeISOsForCreate, handleTreeISOsForDeletion, getTreeNodes } from './treeISOs.js'
import { showUndoSnackbar } from '$lib/store'

export function isValidISODate (dateStr) {
  if (dateStr === '') return true
  const isoFormatRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!isoFormatRegex.test(dateStr)) return false
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

const Task = {
  schema: z.object({
    name: z.string().default('Untitled'),
    duration: z.number().default(30),
    parentID: z.string().default(''),
    startTime: z.string().default(''),
    startDateISO: z.string()
      .default('')
      .refine(isValidISODate, {
        message: 'startDateISO is not in proper yyyy-MM-dd format'
      })
    ,
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
    childrenLayout: z.string().default('normal'), // 'normal' or 'timeline'
    photoLayout: z.string().default('side-by-side'), // 'full-photo' or 'thumbnail'

    orderValue: z.number().optional(), // must be maintained

    treeISOs: z.array(z.string()).optional(), // must be maintained
    rootID: z.string().optional() // must be maintained
  }),

  // danger: relies on `tasksCache`
  create: async ({ id, newTaskObj }) => {
    try {
      const validatedTask = Task.schema.parse(newTaskObj)
      const { uid } = get(user)
      const batch = writeBatch(db)
      const result = await maintainTreeISOsForCreate({ task: validatedTask, batch })
      let treeISOs = []
  
      // BACKWARDS COMPATIBILITY CODE HERE
      if (result && typeof result === 'object' && Array.isArray(result.treeISOs)) {
        treeISOs = result.treeISOs
      } 
      else if (Array.isArray(result)) {
        treeISOs = result
      }

      let rootID = id
      if (validatedTask.parentID) {
        const parent = get(tasksCache)[validatedTask.parentID]
        rootID = parent?.rootID || id
      }

      if (!validatedTask.orderValue) {
        validatedTask.orderValue = get(user).maxOrderValue + 1
        batch.update(doc(db, 'users', uid), { 
          maxOrderValue: increment(2) 
        })
      }

      batch.set(doc(db, `users/${uid}/tasks/${id}`), { 
        treeISOs, 
        rootID, 
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

  update: async ({ id, keyValueChanges }) => {
    try {
      const batch = writeBatch(db)
      const validatedChanges = Task.schema.partial().parse(keyValueChanges)
      
      await maintainTreeISOs({ id, keyValueChanges: validatedChanges, batch })
      batch.update(
        doc(db, `users/${get(user).uid}/tasks/${id}`), 
        validatedChanges
      )
      batch.commit()
    }
    catch (error) {
      alert("Error saving changes to db, please reload")
      console.error("Error in Task.update: ", error)
    }
  },

  delete: async ({ id, willConfirm = true }) => {
    return new Promise(async (resolve) => {
      const taskObj = get(tasksCache)[id]
      const tasksToDelete = await getTreeNodes(taskObj)

      if (!willConfirm || confirm(`${tasksToDelete.length} task${tasksToDelete.length > 1 ? 's' : ''} will be deleted. Are you sure?`)) {
        const { uid } = get(user)
        const batch = writeBatch(db)
    
        for (const taskObj of tasksToDelete) {
          const { imageFullPath, id } = taskObj
          if (imageFullPath) deleteImage({ imageFullPath })
          batch.delete(doc(db, `/users/${uid}/tasks/${id}`))
        }
        await handleTreeISOsForDeletion({ tasksToDelete, batch })
    
        await batch.commit()

        resolve(tasksToDelete)
      }
    })
  },

  archiveTree: async ({ id }) => {
    const taskObj = get(tasksCache)[id]
    const tasks = await getTreeNodes(taskObj)

    const { uid } = get(user)
    const batch = writeBatch(db)

    for (const task of tasks) {
      batch.update(doc(db, `/users/${uid}/tasks/${task.id}`), { 
        isArchived: true
      })
    }

    await batch.commit()

    showUndoSnackbar(
      `${tasks.length} task${tasks.length > 1 ? 's' : ''} archived`,
      () => Task.unarchiveTree({ id })
    )

    return tasks
  },

  unarchiveTree: async ({ id }) => {
    const { uid } = get(user)
    const batch = writeBatch(db)
    const taskObj = get(tasksCache)[id]
    const tasksToUnarchive = await getTreeNodes(taskObj)

    for (const task of tasksToUnarchive) {
      batch.update(doc(db, `/users/${uid}/tasks/${task.id}`), { 
        isArchived: false
      })
    }

    await batch.commit()
  },

  listenToUnscheduled: (userUID, callback) => {
    try {
      const q = query(
        collection(db, "users", userUID, "tasks"),
        where("startDateISO", "==", ""),
        where("isDone", "==", false)
      )
      
      return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        callback(tasks)
      }, (error) => {
        console.error("Error in listenToUnscheduled", error)
        callback([])
      })
    } catch (err) {
      console.error("Error setting up listener in listenToUnscheduled", err)
      return () => {} // Return a no-op unsubscribe function
    }
  },

  getTasksJSONByRange: async (uid, startDate, endDate) => {
    const neededProperties = [
      "duration",
      "isDone",
      "name",
      "notes",
      "startDateISO",
      "startTime",
    ]
    const q = query(
      collection(db, "users", uid, "tasks"),
      where("startDateISO", "!=", ""),
      where("startDateISO", ">=", startDate),
      where("startDateISO", "<=", endDate)
    )

    const getDataArray = (snapshot) => snapshot.docs.map((doc) => doc.data())
    const taskArray = await getDocs(q).then(getDataArray).catch(console.error)

    const reducetoNeeded = (task) =>
      neededProperties.reduce(
        (acc, prop) => ({ [prop]: task[prop] || "", ...acc }),
        {}
      )
    const result = taskArray.map(reducetoNeeded)
    
    return JSON.stringify(result)
  },
  
  // Added method for compatibility with PhotoGrid.svelte
  getByDateRange: async (uid, startDate, endDate) => {
    const q = query(
      collection(db, "users", uid, "tasks"),
      where("startDateISO", ">=", startDate),
      where("startDateISO", "<=", endDate),
      where("imageFullPath", "!=", "")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
  },
  
  // Added method for compatibility with LegacyExportTasks.svelte
  getTasksJSON: async (uid) => {
    // Using getTasksJSONByRange with a wide date range
    const startDate = "2000-01-01"
    const endDate = "2100-12-31"
    return Task.getTasksJSONByRange(uid, startDate, endDate)
  }
}

export default Task