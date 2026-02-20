import Task from './Task.js'
import { z } from 'zod'
import { getAffectedInstances } from '/src/routes/[user]/components/Templates/components/TemplatePopup/instances.js'
import { db } from '$lib/db/init.js'
import { updateFirestoreDoc, deleteFirestoreDoc, releaseImage, getFirestoreCollection } from '$lib/db/helpers.js'
import { user } from '$lib/store'
import { doc, getCountFromServer, sum, getAggregateFromServer, collection, query, setDoc, where } from 'firebase/firestore'
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
    isStarred: z.boolean().default(true),
    imageDownloadURL: z.string().default(''),
    iconURL: z.string().default(''),
    rrStr: z.string().default(''),
    prevEndISO: z.string().default(''),
    previewSpan: z.number().optional(), // needs to be computed
  }),

  async create ({ newTemplate, id }) {
    const validatedTemplate = Template.schema.parse(newTemplate)
    const docRef = doc(db, `/users/${get(user).uid}/templates/${id}`)
    return setDoc(docRef, validatedTemplate, { merge: true }) // `merge: true` matters for generating periodic tasks
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
      Task.update({ id: instance.id, kvChanges: updates })
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

  async getAll () {
    return getFirestoreCollection(`/users/${get(user).uid}/templates`)
  },

  async getTotalStats ({ id }) {
    const q = query(
      collection(db, 'users', get(user).uid, 'tasks'), 
      where('templateID', '==', id), 
      where('isDone', '==', true)
    )
    const [count, minutesSpent] = await Promise.all([
      getCountFromServer(q).then(snapshot => snapshot.data().count),
      getAggregateFromServer(q, {
        minutesSpent: sum('duration')
      }).then(snapshot => snapshot.data().minutesSpent)
    ])
    return { minutesSpent, timesCompleted: count }
  }
}

export default Template 