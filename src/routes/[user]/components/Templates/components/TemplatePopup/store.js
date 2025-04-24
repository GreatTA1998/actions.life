import { writable, get, derived } from 'svelte/store'
import { DateTime } from 'luxon'
import { getOccurrences, instantiateTask } from '$lib/store/templateInstances.js'
import { user } from '$lib/store'
import { template } from '../../store.js'

export const activeTab = writable('weekly')

export const inputStates = writable({
  weekly: '',
  monthlyTypeI: '',
  monthlyTypeII: '',
  yearly: ''
})

export const monthlyInputSourceOfTruth = writable('')
export const overallSourceOfTruth = writable('')
export const pendingRRStr = writable('')

export const deletingTasks = writable([])
export const addingTasks = writable([])
export const exceptions = writable([])

export const hasUnsavedChanges = derived(
  [template, pendingRRStr],
  ([$template, $pendingRRStr]) => $template?.rrStr !== $pendingRRStr
)

derived([pendingRRStr], async ([currentRRStr], set) => {
  if (!get(template)) return

  resetPreviewStates()

  if (currentRRStr === get(template).rrStr) {
    return
  }

  const affectedTasks = await getAffectedTasks(get(template))
  for (const task of affectedTasks) {
    if (isException(task, get(template))) {
      exceptions.update(current => [...current, task])
    } else {
      deletingTasks.update(current => [...current, task])
    }
  }

  addingTasks.set(
    simulateChanges(get(template), currentRRStr)
  )
}).subscribe(() => {})

function getPeriodicity (rrStr) {
  if (!rrStr) return 'weekly'
  
  const lower = rrStr.toLowerCase()
  if (lower.includes('freq=monthly')) return 'monthly'
  if (lower.includes('freq=yearly')) return 'yearly'
  return 'weekly'
}

export function resetPreviewStates() {
  deletingTasks.set([])
  addingTasks.set([])
  exceptions.set([])
}

// returns an array of tasks to be added
export function simulateChanges (template, newRRStr) {
  if (!newRRStr) return []

  const copy = {...template}
  copy.rrStr = newRRStr
  copy.previewSpan = getPreviewSpan(copy)

  const JSDates = getOccurrences({ 
    template: copy, 
    startISO: DateTime.now().toFormat('yyyy-MM-dd'), 
    uid: get(user).uid 
  })

  const newTasks = []
  for (const JSDate of JSDates) {
    newTasks.push(instantiateTask({ template: copy, occurence: JSDate }))
  }
  return newTasks
}

// flawed, should also handle changed dates that falls outside of the original schedule
// for example, if it routine repeats MWF, but the task is scheduled for Thursday, it was modified
export function isException(task, template) {
  if (!task || !template) {
    console.log("isException received null/undefined task or template", {task, template})
    return false
  }
  
  for (const k of Object.keys(task)) {
    if (['notes', 'duration', 'imageDownloadURL', 'iconURL'].includes(k)) {      
      if (task[k] !== template[k]) { 
        console.log("Exception found =", task.id, k, task[k], template[k])
        return true
      }
    }
  }
  return false
}

export function getPreviewSpan ({ rrStr }) {
  switch (getPeriodicity(rrStr)) {
    case 'yearly': return 365 * 2
    case 'monthly': return 31 * 2
    default: return 7 * 2
  }
}

async function getAffectedTasks (template) {
  const db = await import('$lib/db/init.js').then(m => m.db)
  const { collection, query, where, getDocs } = await import('firebase/firestore')
  const userStore = get(user)
  
  const tasksQuery = query(
    collection(db, 'users', userStore.uid, 'tasks'),
    where('templateID', '==', template.id),
    where('startDateISO', '>=', DateTime.now().toFormat('yyyy-MM-dd'))
  )
  const tasksSnapshot = await getDocs(tasksQuery)
  return tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}))
}