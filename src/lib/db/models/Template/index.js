import { z } from 'zod'
import { db } from '/src/lib/db/init.js'
import { updateFirestoreDoc } from '$lib/db/helpers.js'
import { doc, getDocs, collection, query, setDoc, deleteDoc, where } from 'firebase/firestore'
import Task from '../Task.js'
import { DateTime } from 'luxon'

export const getPeriodFromCrontab = (crontab) => {
  if (crontab === '') return 'quick'
  const parts = crontab.split(' ')
  if (parts.length !== 5) throw new Error('Invalid crontab format', crontab, parts)
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
  if (dayOfMonth !== '*' && month !== '*' && dayOfWeek === '*') return 'yearly'
  if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') return 'monthly'
  if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') return 'weekly'
  console.error('Invalid crontab format', crontab)
  return 'unknown'
}

export const getTotalStats = async ({ userID, id }) => {
  const q = query(
    collection(db, "users", userID, "tasks"), 
    where('templateID', '==', id), 
    where('startDateISO', '<=', DateTime.now().toFormat('yyyy-MM-dd')), 
    where('isDone', '==', true)
  )
  const snapshot = await getDocs(q)
  const totalMinutesSpent = snapshot.docs.reduce((acc, doc) => acc + doc.data().duration, 0)
  const totalTasksCompleted = snapshot.docs.length
  return [totalTasksCompleted, totalMinutesSpent]
}

const Template = {
  schema: z.object({
    name: z.string(),
    orderValue: z.number().default(0),
    lastGeneratedTask: z.string().default(''),
    tags: z.string().default(''),
    timeZone: z.string(),
    notes: z.string().default(''),
    notify: z.string().default(''),
    duration: z.number().default(0),
    startTime: z.string().default(''),
    isStarred: z.boolean().default(false),
    rrStr: z.string().default(''),
    previewSpan: z.number().default(2 * 7),
    prevEndISO: z.string().default(''),
    imageDownloadURL: z.string().default(''),
    iconURL: z.string().default(''),
  }),

  async create ({ userID, newTemplate, templateID }) {
    Template.schema.parse(newTemplate)
    const docRef = doc(db, 'users', userID, 'templates', templateID)
    return setDoc(docRef, newTemplate, { merge: true }) // `merge: true` matters for generating periodic tasks
  },

  // THESE ARE THE ONLY TWO FUNCTIONS THAT UPDATE THE TEMPLATE
  async update ({ userID, id, updates, newTemplate }) {
    return new Promise(async (resolve) => {
      const validatedChanges = Template.schema.partial().parse(updates)
      await updateFirestoreDoc(`/users/${userID}/templates/${id}`, validatedChanges)
      resolve()
    })

    // this is `Task`, not `Template`
    // note: these tasks need to be set with { merge: true }
    return
    Task.updateQuickTasks({ userID, templateID: id, updates })
  },

  async updateWithTasks ({ userID, id, updates, newTemplate }) {
    // updateDoc(doc(db, "users", userID, 'templates', id), updates)
  },
  ////////////////////////////////

  async getAll ({ userID, includeStats = true }) {
    const q = query(collection(db, "users", userID, "templates"))
    const snapshot = await getDocs(q)
    const arraywithIds = snapshot.docs.map((doc) => ({ 
      ...doc.data(), 
      id: doc.id, 
      userID: doc.ref.parent.parent.id 
    }))
    
    if (!includeStats) return arraywithIds

    for (const template of arraywithIds) {
      const [totalTasksCompleted, totalMinutesSpent] = await getTotalStats({ userID, id: template.id })
      template.totalTasksCompleted = totalTasksCompleted
      template.totalMinutesSpent = totalMinutesSpent
    }
    return arraywithIds
  },

  async delete ({ userID, id }) {
    return deleteDoc(doc(db, "users", userID, "templates", id))
  },

  getPeriodFromCrontab
}

export default Template 