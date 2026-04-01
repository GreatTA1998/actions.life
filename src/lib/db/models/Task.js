import { z } from 'zod'
import { releaseImage, maintainOrderValue } from '$lib/db/helpers.js'
import { get } from 'svelte/store'
import { user, tasksCache, cleanupCache, showUndoSnackbar } from '$lib/store'
import { closeTaskPopup } from '$lib/store/taskPopup.js'
import { 
  writeBatch, getDocs, collection, 
  query, where, doc
} from 'firebase/firestore'
import { db } from '$lib/db/init.js'
import { maintainTreeISOs, updateEntireTree, handleTreeISOsForDeletion, getSubtreeNodes } from './treeISOs.js'
import { playSound } from '$lib/features/audio.js'
import { randomID } from '$lib/utils/core.js'

const Task = {
  schema: z.object({
    name: z.string().default(''),
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
    childrenLayout: z.string().default('normal'), // 'normal' (renaming to 'list' but requires proper migration) or 'timeline'
    photoLayout: z.string().default('side-by-side'), // 'full-photo' or 'thumbnail'
    isCollapsed: z.boolean().default(false),
    tagIDs: z.array(z.string()).default([]),

    onList: z.boolean(), // now mandatory
    
    // maintained fields
    orderValue: z.number(),
    treeISOs: z.array(z.string()), 
    rootID: z.string() 
  }),

  async create ({ id = randomID(), data, optimistic = true }) {
    const batch = writeBatch(db)
    maintainOrderValue(data, batch)

    const { parentID, startDateISO } = data 
    
    if (!parentID) {
      data.rootID = id
      data.treeISOs = [startDateISO].filter(Boolean)
    }
    else {
      const parent = get(tasksCache)[parentID]
      data.rootID = parent.rootID
      data.tagIDs = parent.tagIDs
      data.treeISOs = [...parent.treeISOs, startDateISO].filter(Boolean) 
      if (startDateISO) { // though it's currently to create a scheduled subtask via UI
        await updateEntireTree({ batch, parent, treeISOs: data.treeISOs })
      }
    }

    const validatedTask = Task.schema.parse(data)
    
    batch.set(doc(db, `users/${get(user).uid}/tasks/${id}`), validatedTask)
    
    if (optimistic) batch.commit()
    else await batch.commit() 

    return { ...validatedTask, id }
  },

  async update ({ id, kvChanges, undoable = true }) {
    if (get(user).simpleMode) {
      if (kvChanges.startDateISO || kvChanges.isDone) { // via datepicker, drag-to-calendar, checkbox, or photo upload
        kvChanges.onList = false
      } 
      else if (kvChanges.onList) {  // only possible via drag-to-list
        kvChanges.startDateISO = ''
        kvChanges.startTime = ''
      }
    }
  
    const validatedChanges = Task.schema.partial().parse(kvChanges)

    if (validatedChanges.isDone) playSound('swipe', 0.1)

    const batch = writeBatch(db)

    if (validatedChanges.orderValue) {
      maintainOrderValue(validatedChanges, batch)
    }
    await maintainTreeISOs({ id, kvChanges: validatedChanges, batch })
    batch.update(
      doc(db, `users/${get(user).uid}/tasks/${id}`), 
      validatedChanges
    )
    await batch.commit()

    // specifically protect against done tasks disappearing during simple mode
   
    if (undoable) {
      const task = get(tasksCache)[id]
      if (validatedChanges.onList === false && !(task.startDateISO || validatedChanges.startDateISO)) {
        showUndoSnackbar(
          `Hiding 1 task from the list`,
          () => Task.update({ id, kvChanges: { onList: true } })
        )
      }
    }
    return validatedChanges
  },

  async delete ({ id }) {
    closeTaskPopup()
    const task = get(tasksCache)[id]
    const treeNodes = await getSubtreeNodes(task)

    // warning: need a way to disable this confirmation when we support sub-tasks for routines
    if (treeNodes.length >= 2 && !confirm(`Are you sure you want to delete ${treeNodes.length} actions at once?`)) {
      return []
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
    
    return treeNodes
  },

  async archiveTree ({ id }) {
    const task = get(tasksCache)[id]
    const tasks = await getSubtreeNodes(task)

    const { uid } = get(user)
    const batch = writeBatch(db)

    for (const task of tasks) {
      batch.update(doc(db, `/users/${uid}/tasks/${task.id}`), { 
        onList: false
      })
    }

    await batch.commit()

    showUndoSnackbar(
      `${tasks.length} task${tasks.length > 1 ? 's' : ''} archived from the list`,
      () => Task.unarchiveTree({ id })
    )

    return tasks
  },

  async unarchiveTree ({ id }) {
    const { uid } = get(user)
    const batch = writeBatch(db)
    const task = get(tasksCache)[id]
    const tasksToUnarchive = await getSubtreeNodes(task)

    for (const task of tasksToUnarchive) {
      batch.update(doc(db, `/users/${uid}/tasks/${task.id}`), { 
        onList: true
      })
    }

    await batch.commit()
  },

  async getByDateRange (startDate, endDate) {
    const q = query(
      collection(db, 'users', get(user).uid, 'tasks'),
      where('startDateISO', '>=', startDate),
      where('startDateISO', '<=', endDate),
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
  }
}

function isValidISODate (dateStr) {
  if (dateStr === '') return true
  const isoFormatRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!isoFormatRegex.test(dateStr)) return false
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

export default Task