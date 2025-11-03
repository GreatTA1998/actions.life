import Task from './Task.js'
import { z } from 'zod'
import { getAffectedInstances } from '/src/routes/[user]/components/Templates/components/TemplatePopup/instances.js'
import { db } from '$lib/db/init.js'
import { updateFirestoreDoc, deleteFirestoreDoc, releaseImage } from '$lib/db/helpers.js'
import { user } from '$lib/store'
import { doc, getDocs, collection, query, setDoc, deleteDoc, where } from 'firebase/firestore'
import { DateTime } from 'luxon'
import { get } from 'svelte/store'

const Template = {
  schema: z.object({
    name: z.string(),
    duration: z.number().default(0),
    startTime: z.string().default(''),
    orderValue: z.number().default(0),
    lastGeneratedTask: z.string().default(''),
    tags: z.string().default(''),
    timeZone: z.string(),
    notes: z.string().default(''),
    notify: z.string().default(''),
    isStarred: z.boolean().default(false),
    imageDownloadURL: z.string().default(''),
    iconURL: z.string().default(''),
    rrStr: z.string().default(''),
    previewSpan: z.number().default(2 * 7),
    prevEndISO: z.string().default('')
  }),

  async create ({ newTemplate, id }) {
    Template.schema.parse(newTemplate)
    const docRef = doc(db, `/users/${get(user).uid}/templates/${id}`)
    return setDoc(docRef, newTemplate, { merge: true }) // `merge: true` matters for generating periodic tasks
  },

  async update ({ id, updates }) {
    return new Promise(async (resolve) => {
      const validatedChanges = Template.schema.partial().parse(updates)
      await updateFirestoreDoc(`/users/${get(user).uid}/templates/${id}`, validatedChanges)
      resolve()
    })
  },

  async updateItselfAndFutureInstances ({ id, updates }) {
    this.update({ id, updates })
    const futureInstances = await getAffectedInstances({ id })
    for (const instance of futureInstances) {
      Task.update({ id: instance.id, keyValueChanges: updates })
    }
  },

  async delete ({ id, imageDownloadURL = '', imageFullPath = '' }) {
    const futureInstances = await getAffectedInstances({ id })
    if (futureInstances.length > 0) {
      if (confirm(`There are ${futureInstances.length} future instances of this template. Delete them also?`)) {
        for (const instance of futureInstances) {
          Task.delete({ id: instance.id })
        }
      }
    }
   
    const { uid } = get(user)
    if (imageDownloadURL && imageFullPath) {
      await releaseImage(uid, { imageDownloadURL, imageFullPath })
    }
    deleteFirestoreDoc(`/users/${uid}/templates/${id}`)
  },

  async getAll ({ userID, includeStats = true }) {
    const q = query(collection(db, "users", userID, "templates"))
    const snapshot = await getDocs(q)
    const arraywithIds = snapshot.docs.map((doc) => ({ 
      ...doc.data(), 
      id: doc.id, 
      userID: doc.ref.parent.parent.id 
    }))
    return arraywithIds
  },

  async getTotalStats ({ id }) {
    return new Promise(async (resolve) => {
      const q = query(
        collection(db, "users", get(user).uid, "tasks"), 
        where('templateID', '==', id), 
        where('startDateISO', '<=', DateTime.now().toFormat('yyyy-MM-dd')), 
        where('isDone', '==', true)
      )
      const snapshot = await getDocs(q)
      resolve({
        minutesSpent: snapshot.docs.reduce((acc, doc) => acc + doc.data().duration, 0),
        timesCompleted: snapshot.docs.length
      })
    })
  }
}

export default Template 