import Task from './Task.js'
import { z } from 'zod'
import { db } from '$lib/db/init.js'
import { updateFirestoreDoc, 
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
import { updateCache } from '$lib/store/tasksCache.js'
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
    imageFullPath: z.string().default(''),
    iconURL: z.string().default(''),

    rrStr: z.string().default(''),
    prevEndISO: z.string().default(''),
    previewSpan: z.number().default(14), // needs to be computed
    isStarred: z.boolean().default(true),

    rootID: z.string(),
    parentID: z.string().default(''),
    isDone: z.boolean().default(false),
    isCollapsed: z.boolean().default(false)
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
    const validatedChanges = Template.schema.partial().parse(kvChanges)
    return updateFirestoreDoc(`/users/${get(user).uid}/templates/${id}`, validatedChanges)
  },

  async updateItselfAndFutureInstances ({ id, kvChanges }) {
    this.update({ id, kvChanges })
    const futureInstances = await this.getAffectedInstances({ id })
    for (const instance of futureInstances) {
      Task.update({ id: instance.id, kvChanges })
    }
  },

  async delete ({ id }) {
    const { uid } = get(user)
    const futureInstances = await this.getAffectedInstances({ id })

    if (futureInstances.length && confirm(`There are ${futureInstances.length} future instances of this template. Delete them also?`)) {
      for (const instance of futureInstances) {
        Task.delete({ id: instance.id }) // cascades subroutine task instances via getSubtreeNodes
      }
    }

    const batch = writeBatch(db)
    const allTemplates = await getFirestoreCollection(`/users/${uid}/templates`)
    const memo = nodesByParent(allTemplates)
    
    function deleteSubtree (nodeID) {
      const node = allTemplates.find(template => template.id === nodeID)
      releaseImage(uid, node) // warning: not atomic (excluded from batch)
      batch.delete(doc(db, `/users/${uid}/templates/${nodeID}`))
      for (const child of memo[nodeID]) {
        deleteSubtree(child.id)
      }
    }

    deleteSubtree(id)
    return batch.commit()
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

  async fromTemplate ({ template, modifiers = {} }) {
    const allTemplates = await getFirestoreCollection(`/users/${get(user).uid}/templates`)

    return clone({
      id: randomID(),
      node: { ...template, ...modifiers },
      parentID: modifiers.parentID || '',
      memo: nodesByParent(allTemplates.filter(T => T.rootID === template.rootID))
    })
  }
}

// `rootID` and `orderValue` are taken care of in Template.create()
async function clone ({ node, id, parentID, memo }) {
  const { orderValue, rrStr, prevEndISO, previewSpan, ...rest } = node // recurrence fields are dropped because only top-level routines may recur.
  const result = await Template.create({ id, data: { ...rest, parentID } })

  for (const child of memo[node.id]) {
    clone({
      node: child,
      id: randomID(),
      parentID: id,
      memo
    })
  }
  return result
}

export default Template 