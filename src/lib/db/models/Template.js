import Task from './Task.js'
import { z } from 'zod'
import { getAffectedInstances } from '/src/routes/[user]/components/Templates/components/TemplatePopup/instances.js'
import { db } from '$lib/db/init.js'
import { updateFirestoreDoc, 
  deleteFirestoreDoc, 
  releaseImage, 
  getFirestoreCollection,
  maintainOrderValue
} from '$lib/db/helpers.js'
import { user } from '$lib/store'
import { 
  writeBatch, doc, getCountFromServer, 
  sum, getAggregateFromServer, collection, 
  query, where 
} from 'firebase/firestore'
import { get } from 'svelte/store'

const Template = {
  schema: z.object({
    name: z.string(),
    duration: z.number().default(30),
    startTime: z.string().default(''),
    orderValue: z.number(),
    tags: z.string().default(''),
    notes: z.string().default(''),
    imageDownloadURL: z.string().default(''),
    iconURL: z.string().default(''),
    parentID: z.string().default(''),

    rrStr: z.string().default(''),
    prevEndISO: z.string().default(''),
    previewSpan: z.number().optional(), // needs to be computed
    isStarred: z.boolean().default(true),

    rootID: z.string(),
    parentID: z.string().default('')

    // TO DEPRECATE
    // notify: z.string().default(''),
    // lastGeneratedTask: z.string().default(''),
  }),

  async create ({ data, id }) {
    const batch = writeBatch(db)

    if (data.parentID) {
      const templates = await getFirestoreCollection(`/users/${get(user).uid}/templates`)
      data.rootID = templates.find(template => template.id === data.parentID).rootID
    } else {
      data.rootID = id
    }

    maintainOrderValue(data, batch) // mutates data and batch

    const validatedTemplate = Template.schema.parse(data)
    
    batch.set(
      doc(db, `/users/${get(user).uid}/templates/${id}`),
      validatedTemplate, 
      { merge: true } // matters for generating periodic tasks
    ) 
   
    await batch.commit()

    return validatedTemplate
  },

  async update ({ id, kvChanges }) {
    return new Promise(async (resolve) => {
      const validatedChanges = Template.schema.partial().parse(kvChanges)
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