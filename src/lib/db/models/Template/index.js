import { z } from 'zod'
import { db } from '/src/lib/db/init.js'
import { updateFirestoreDoc } from '$lib/db/helpers.js'
import {
  doc,
  getDocs,
  collection,
  query,
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore"
import Task from '../Task.js'
import { getPeriodFromCrontab, deleteFutureTasks, postFutureTasks, getTotalStats } from './utils.js'

const Template = {
  schema: z.object({
    name: z.string(),
    orderValue: z.number().default(0),
    lastGeneratedTask: z.string().default(''),
    crontab: z.string().default(''),
    iconURL: z.string().default(''),
    tags: z.string().default(''),
    timeZone: z.string(),
    notes: z.string().default(''),
    notify: z.string().default(''),
    duration: z.number().default(0),
    startTime: z.string().default(''),
    isStarred: z.boolean().default(false),
    rrStr: z.string().default('')
  }),

  async create ({ userID, newTemplate, templateID }) {
    Template.schema.parse(newTemplate)
    const docRef = doc(db, "users", userID, 'templates', templateID)
    return setDoc(docRef, newTemplate)
  },

  // THESE ARE THE ONLY TWO FUNCTIONS THAT UPDATE THE TEMPLATE
  async update ({ userID, id, updates, newTemplate }) {
    const validatedChanges = Template.schema.partial().parse(updates)
    updateFirestoreDoc(`/users/${userID}/templates/${id}`, validatedChanges)

    // this is `Task`, not `Template`
    return
    Task.updateQuickTasks({ userID, templateID: id, updates })
  },

  async updateWithTasks ({ userID, id, updates, newTemplate }) {
    updateDoc(doc(db, "users", userID, 'templates', id), updates)
    if (newTemplate.crontab !== '0 0 0 * *' && newTemplate.crontab !== '0 0 * * 0') {
      deleteFutureTasks({ userID, id })
      postFutureTasks({ userID, id, newTemplate })
    }
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
    deleteFutureTasks({ userID, id })
    return deleteDoc(doc(db, "users", userID, "templates", id))
  },

  getPeriodFromCrontab
}

export default Template 