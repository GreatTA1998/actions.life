import Task from './Task.js'
import { z } from 'zod'
import { db } from '$lib/db/init.js'
import { updateFirestoreDoc, 
  deleteFirestoreDoc, 
  releaseImage, 
  getFirestoreCollection,
  maintainOrderValue,
  getFirestoreQuery,
} from '$lib/db/helpers.js'
import { user } from '$lib/store'
import { 
  writeBatch, doc, getCountFromServer, 
  sum, getAggregateFromServer, collection, 
  query, where 
} from 'firebase/firestore'
import { get } from 'svelte/store'
import { DateTime } from 'luxon'
import { nodesByParent } from '$lib/db/tree.ts'
import { updateCache, tasksCache } from '$lib/store/tasksCache.js'
import { randomID } from '$lib/utils/core.js'

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

  async updateItselfAndFutureInstances ({ id, kvChanges }) {
    this.update({ id, kvChanges })
    const futureInstances = await this.getAffectedInstances({ id })
    for (const instance of futureInstances) {
      Task.update({ id: instance.id, kvChanges })
    }
  },

  async delete ({ id, imageDownloadURL = '', imageFullPath = '' }) {
    const futureInstances = await this.getAffectedInstances({ id })
    
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

  async getAffectedInstances (template) {
    const taskInstances = await getFirestoreQuery(
      query(
        collection(db, 'users', get(user).uid, 'tasks'),
        where('templateID', '==', template.id),
        where('startDateISO', '>=', DateTime.now().toFormat('yyyy-MM-dd'))
      )
    )
    updateCache(taskInstances) // Task.delete relies on cache, for example
    return taskInstances
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
  },

  // only top-level tasks can be templates i.e. parentID === ''
  async instantiateTree ({ template, modifiers = {}, idempotentISO = '' }) {
    const allTemplates = await getFirestoreCollection(`/users/${get(user).uid}/templates`)
    const newTreeID = idempotentISO ? `${template.id}_${idempotentISO}` : randomID()
    const { parentID } = modifiers

    return helper({ 
      node: { ...template, ...modifiers }, 
      parentID: parentID ? parentID : '',
      rootID: parentID ? get(tasksCache)[parentID].rootID : newTreeID,
      id: newTreeID,
      templateID: (typeof template.rrStr === 'string') ? template.id : '',
      onList: !!modifiers.onList, // `template.onList` doesn't matter, example: calendar task forged into a template, which instantiates onto the list.
      memo: nodesByParent(allTemplates.filter(T => T.rootID === template.rootID)),
    })
  }
}

async function helper ({ node, id, parentID, rootID, templateID, onList, memo }) {
  const result = await Task.create({ id, data: { 
    ...node, parentID, rootID, templateID, onList
  }}) 
  updateCache([result])

  // treeISOs will be maintained by Task.create() as long as `parent` and `tasksCache` are created before children
  for (const child of memo[node.id]) {
    helper({ 
      node: child, 
      parentID: id,
      rootID,  
      id: randomID(), 
      templateID: '',
      onList,
      memo
    })
  }
  return result
}

export default Template 