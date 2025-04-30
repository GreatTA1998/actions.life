import { z } from 'zod'
import { db } from '$lib/db/init.js'
import { updateFirestoreDoc } from '$lib/db/helpers.js'
import { user } from '$lib/store'
import { doc, getDocs, collection, query, setDoc, deleteDoc, where } from 'firebase/firestore'
import { DateTime } from 'luxon'
import { get } from 'svelte/store'

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
    iconURL: z.string().default('')
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

  async delete ({ userID, id }) {
    alert('Not implemented yet')
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
      console.log("returning =", {
        minutesSpent: snapshot.docs.reduce((acc, doc) => acc + doc.data().duration, 0),
        timesCompleted: snapshot.docs.length
      })
      resolve({
        minutesSpent: snapshot.docs.reduce((acc, doc) => acc + doc.data().duration, 0),
        timesCompleted: snapshot.docs.length
      })
    })
  }
}

export default Template 