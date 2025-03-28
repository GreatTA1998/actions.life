import { z } from 'zod'
import { deleteImage } from '/src/lib/db/helpers.js'
import { get } from 'svelte/store'
import { user, tasksCache } from '/src/lib/store/index.js'
import { 
  writeBatch, 
  getDocs, 
  collection, 
  query, 
  where, 
  updateDoc, 
  onSnapshot, 
  doc 
} from 'firebase/firestore'
import { db } from '/src/lib/db/init.js'
import { maintainTreeISOs, maintainTreeISOsForCreate, handleTreeISOsForDeletion } from './treeISOs.js'
import { getTreeNodes } from './treeISOs.js'

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

    treeISOs: z.array(z.string()).optional(), // must be maintained
    rootID: z.string().optional() // must be maintained
  }),

  // Individual task operations
  create: async ({ id, newTaskObj }) => {
    try {
      const batch = writeBatch(db)
      const validatedTask = Task.schema.parse({ ...newTaskObj })
      const result = await maintainTreeISOsForCreate({ task: validatedTask, batch })
      let treeISOs = []
      
      // If result is an object with treeISOs property, use that
      if (result && typeof result === 'object' && Array.isArray(result.treeISOs)) {
        treeISOs = result.treeISOs
      } 
      // If result is directly an array, use that
      else if (Array.isArray(result)) {
        treeISOs = result
      }

      // Set rootID - either parent's rootID or self if root
      let rootID = id // Default to self (for root tasks)
      if (validatedTask.parentID) {
        const parent = get(tasksCache)[validatedTask.parentID]
        rootID = parent?.rootID || id
      }

      batch.set(doc(db, `users/${get(user).uid}/tasks/${id}`), { 
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

  // FIRST TRY THIS FOR UDPATE
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

  delete: async ({ id }) => {
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
    await handleTreeISOsForDeletion({ tasksToDelete, batch })

    await batch.commit()
    return tasksToDelete
  },

  // Collection operations
  updateQuickTasks: async ({ userID, templateID, updates }) => {
    const q = query(collection(db, "users", userID, "tasks"), where("templateID", "==", templateID))
    const snapshot = await getDocs(q)
    const updatePromises = snapshot.docs.map(doc => updateDoc(doc.ref, updates))
    return Promise.all(updatePromises)
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
      where("rootStartDateISO", "!=", ""),
      where("rootStartDateISO", ">=", startDate),
      where("rootStartDateISO", "<=", endDate)
    )
    const getDataArray = (snapshot) => snapshot.docs.map((doc) => doc.data())
    const taskArray = await getDocs(q).then(getDataArray).catch(console.error)

    const reducetoNeeded = (task) =>
      neededProperties.reduce(
        (acc, prop) => ({ [prop]: task[prop] || "", ...acc }),
        {}
      )
    return JSON.stringify(taskArray.map(reducetoNeeded))
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

function pushDescendants (parentID, tasksToDelete) {
  Object.values(get(tasksCache)).forEach(t => {
    if (t.parentID === parentID) {
      tasksToDelete.push(t)
      pushDescendants(t.id, tasksToDelete)
    }
  })
} 

export default Task