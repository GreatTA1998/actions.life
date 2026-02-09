import { z } from 'zod'
import { releaseImage } from '$lib/db/helpers.js'
import { get } from 'svelte/store'
import { user, tasksCache, cleanupCache, showUndoSnackbar } from '$lib/store'
import { 
  writeBatch, getDocs, increment, 
  collection, query, where, 
  onSnapshot, doc
} from 'firebase/firestore'
import { db } from '$lib/db/init.js'
import { maintainTreeISOs, updateEntireTree, handleTreeISOsForDeletion, getSubtreeNodes } from './treeISOs.js'

const Task = {
  schema: z.object({
    name: z.string().default('Untitled'),
    duration: z.number().default(30),
    parentID: z.string().default(''),
    startTime: z.string().default(''),
    startDateISO: z.string().default('')
      .refine(isValidISODate, {
        message: 'startDateISO is not in proper yyyy-MM-dd format'
      })
    ,
    iconURL: z.string().default(''),
    timeZone: z.string().default(Intl.DateTimeFormat().resolvedOptions().timeZone),
    notes: z.string().default(''),
    templateID: z.string().default(''),
    isDone: z.boolean().default(false),
    imageDownloadURL: z.string().default(''),
    imageFullPath: z.string().default(''),
    tags: z.string().default(''),
    isArchived: z.boolean().default(false),
    persistsOnList: z.boolean().default(true),
    childrenLayout: z.string().default('normal'), // 'normal' (renaming to 'list' but requires proper migration) or 'timeline'
    photoLayout: z.string().default('side-by-side'), // 'full-photo' or 'thumbnail'
    isCollapsed: z.boolean().default(false),
    tagIDs: z.array(z.string()).default([]),
    
    // maintained fields
    orderValue: z.number().optional(),
    treeISOs: z.array(z.string()).optional(), 
    rootID: z.string().optional() 
  }),

  create: async ({ id, newTaskObj, optimistic = true }) => {
    try {
      const validatedTask = Task.schema.parse(newTaskObj)
      const { parentID, startDateISO } = validatedTask
      const parent = get(tasksCache)[parentID]
      
      if (parent?.tagIDs) validatedTask.tagIDs = parent.tagIDs

      const { uid } = get(user)
      const batch = writeBatch(db)

      let treeISOs = [...(parent?.treeISOs ?? []), startDateISO].filter(Boolean)
      if (startDateISO && parent) { // currently impossible via UI to create a scheduled subtask directly
        await updateEntireTree({ batch, parent, treeISOs })
      }
      maintainOrderValue(validatedTask, batch)

      batch.set(doc(db, `users/${uid}/tasks/${id}`), { 
        ...validatedTask,
        treeISOs, 
        rootID: parent ? parent.rootID : id
      })
      
      if (optimistic) batch.commit()
      else await batch.commit() 

      return validatedTask
    } 
    catch (error) {
      console.error('Error creating task:', error)
      alert('Error creating task: ' + error.message)
      return error
    }
  },

  update: async ({ id, keyValueChanges }) => {
    try {
      if (get(user).simpleMode) {
        const { startDateISO, isDone, persistsOnList, isArchived } = keyValueChanges

        if (startDateISO || isDone) { // via datepicker, drag-to-calendar, checkbox, or photo upload
          keyValueChanges.isArchived = true
        } 
        else if (persistsOnList && !isArchived) {  // only possible via drag-to-list
          keyValueChanges.startDateISO = ''
          keyValueChanges.startTime = ''
        }
      }
    
      const validatedChanges = Task.schema.partial().parse(keyValueChanges)
      const batch = writeBatch(db)

      if (validatedChanges.orderValue) {
        maintainOrderValue(validatedChanges, batch)
      }
      await maintainTreeISOs({ id, keyValueChanges: validatedChanges, batch })
      batch.update(
        doc(db, `users/${get(user).uid}/tasks/${id}`), 
        validatedChanges
      )
      batch.commit()

      // specifically protect against done tasks disappearing during simple mode
      const task = get(tasksCache)[id]
      if (validatedChanges.isArchived && !(task.startDateISO || validatedChanges.startDateISO)) {
        showUndoSnackbar(
          `Archiving 1 task from the list area`,
          () => Task.update({ id, keyValueChanges: { isArchived: false } })
        )
      }
    }
    catch (error) {
      alert("Error saving changes to db, please reload")
      console.error("Error in Task.update: ", error)
    }
  },

  delete: async ({ id }) => {
    return new Promise(async (resolve) => {
      const task = get(tasksCache)[id]
      const treeNodes = await getSubtreeNodes(task)

      // warning: need a way to disable this confirmation when we support sub-tasks for routines
      if (treeNodes.length >= 2 && !confirm(`Are you sure you want to delete ${treeNodes.length} actions at once?`)) {
        return resolve([])
      }

      const batch = writeBatch(db)
      const { uid } = get(user)
      for (const node of treeNodes) {
        if (node.imageFullPath) releaseImage(uid, node)
        batch.delete(doc(db, `/users/${uid}/tasks/${node.id}`))
      }
      await handleTreeISOsForDeletion({ batch, tasksToDelete: treeNodes }) // modifies `batch` before commiting
      cleanupCache(treeNodes) // previous operations and sub-operations depend on `tasksCache`
      
      await batch.commit()
      
      resolve(treeNodes)
    })
  },

  archiveTree: async ({ id }) => {
    const task = get(tasksCache)[id]
    const tasks = await getSubtreeNodes(task)

    const { uid } = get(user)
    const batch = writeBatch(db)

    for (const task of tasks) {
      batch.update(doc(db, `/users/${uid}/tasks/${task.id}`), { 
        isArchived: true
      })
    }

    await batch.commit()

    showUndoSnackbar(
      `Archiving ${tasks.length} task${tasks.length > 1 ? 's' : ''} from the list area`,
      () => Task.unarchiveTree({ id })
    )

    return tasks
  },

  unarchiveTree: async ({ id }) => {
    const { uid } = get(user)
    const batch = writeBatch(db)
    const task = get(tasksCache)[id]
    const tasksToUnarchive = await getSubtreeNodes(task)

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

  getByDateRange: async (startDate, endDate) => {
    const q = query(
      collection(db, 'users', get(user).uid, 'tasks'),
      where('startDateISO', '>=', startDate),
      where('startDateISO', '<=', endDate),
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
  }
}

export function isValidISODate (dateStr) {
  if (dateStr === '') return true
  const isoFormatRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!isoFormatRegex.test(dateStr)) return false
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

function maintainOrderValue (validatedObj, batch) {
  const { maxOrderValue, uid } = get(user)
  if (!validatedObj.orderValue) {
    validatedObj.orderValue = maxOrderValue + 1 // k = 1
  }
  const diff = validatedObj.orderValue - maxOrderValue
  if (diff > 0) {
    batch.update(doc(db, 'users', uid), { 
      maxOrderValue: increment(diff)
    })
  }
}

export default Task