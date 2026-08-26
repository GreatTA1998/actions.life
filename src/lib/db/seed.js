import { DateTime } from 'luxon'
import { get } from 'svelte/store'
import Task from '$lib/db/models/Task.js'
import Template from '$lib/db/models/Template.js'
import { user } from '$lib/store'
import { getPreviewSpan } from '$lib/utils/rrule.js'
import { db } from '$lib/db/init.js'
import { writeBatch, doc, increment } from 'firebase/firestore'

/**
 * Builds validated seed docs in memory (parents before children) so the demo
 * can be written in a single Firestore batch instead of N sequential creates.
 */
export function buildSeedDocuments ({ maxOrderValue, now = DateTime.now() }) {
  let orderValue = maxOrderValue
  const tasksById = {}
  const tasks = []

  for (const { id, data } of resolveRelativeDates(SEED_TASKS, now)) {
    orderValue += 1
    const { parentID, startDateISO } = data

    let built
    if (!parentID) {
      built = Task.schema.parse({
        ...data,
        orderValue,
        rootID: id,
        treeISOs: [startDateISO].filter(Boolean)
      })
    } else {
      const parent = tasksById[parentID]
      const treeISOs = [...parent.treeISOs, startDateISO].filter(Boolean)
      built = Task.schema.parse({
        ...data,
        orderValue,
        rootID: parent.rootID,
        tagIDs: parent.tagIDs,
        treeISOs
      })
      if (startDateISO) {
        for (const task of Object.values(tasksById)) {
          if (task.rootID === parent.rootID) task.treeISOs = treeISOs
        }
      }
    }

    tasksById[id] = built
    tasks.push({ id, data: built })
  }

  // After child dates may have widened family treeISOs, re-sync from the map
  for (const entry of tasks) {
    entry.data = { ...tasksById[entry.id] }
  }

  const templates = []
  const prevEndISO = now.toUTC().minus({ days: 1 }).toFormat('yyyy-MM-dd')

  for (const { id, ...data } of SEED_TEMPLATES) {
    orderValue += 1
    templates.push({
      id,
      data: Template.schema.parse({
        ...data,
        orderValue,
        rootID: id,
        previewSpan: getPreviewSpan({ rrStr: data.rrStr }),
        prevEndISO
      })
    })
  }

  return { tasks, templates, maxOrderValue: orderValue }
}

export async function initializeSeedData () {
  const { uid, maxOrderValue } = get(user)
  const { tasks, templates, maxOrderValue: nextMax } = buildSeedDocuments({
    maxOrderValue,
    now: DateTime.now()
  })

  const batch = writeBatch(db)
  for (const { id, data } of tasks) {
    batch.set(doc(db, `users/${uid}/tasks/${id}`), data)
  }
  for (const { id, data } of templates) {
    batch.set(doc(db, `users/${uid}/templates/${id}`), data, { merge: true })
  }
  const diff = nextMax - maxOrderValue
  if (diff > 0) {
    batch.update(doc(db, 'users', uid), {
      maxOrderValue: increment(diff)
    })
  }

  await batch.commit()
  user.update(u => ({ ...u, maxOrderValue: nextMax }))
}

function resolveRelativeDates (tasks, today) {
  return tasks.map(({ id, dayOffset, offset, ...data }) => {
    const duration = offset ?? (dayOffset != null ? { days: dayOffset } : null)
    if (duration) {
      data.startDateISO = today.plus(duration).toFormat('yyyy-MM-dd')
    }
    return { id, data }
  })
}

const PHOTOS = {
  olaDrawingByDad: 'https://i.imgur.com/Pu7PxCi.jpeg',
  redCrownBird: 'https://i.imgur.com/waIioxd.jpeg'
}

const ICON = {
  waterPlant: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FEPtvgSIsPkpznSIffOoa.png?alt=media&token=018a960d-1f76-47eb-a0fe-85c6a5423bd9',
  drinkWater: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2F6w6I9VRWZLRWqphuLgFz.png?alt=media&token=ba68dd3b-83fe-4ed2-bc38-9a2888d31f1b',
  meditate: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FhsCFkECSF4PcFt6MOcW0.png?alt=media&token=d4ed8987-9001-43bc-b48b-4f36caef6fb1',
  laundry: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2Fk49WsIjV1kQ2e6MW52BR.png?alt=media&token=0d44da5b-dfd7-4ff3-9971-3637b748c6be',
}

/**
 * Parents MUST appear before their children (Task.create reads the parent rootID and treeISOs)
 *
 * Only "stable" properties are stored here — fields that are computed at
 * creation time (orderValue, treeISOs, rootID) are intentionally omitted.
 * 
 * dayOffset – (optional) days from today, becomes startDateISO at build time
 * offset – (optional) luxon Duration-like object ({ months, days, ... }); preferred for month-scale dates
 */
const SEED_TASKS = [
  { id: 'photo-bird', 
    name: 'Bird-watching with family',
    imageDownloadURL: PHOTOS.redCrownBird, 
    dayOffset: 0, 
    startTime: DateTime.now().toFormat('HH:mm'), 
    onList: false,
    duration: 106,
    isDone: true
  },
  { id: 'photo-dog', 
    name: 'Drawing with friends',
    imageDownloadURL: PHOTOS.olaDrawingByDad, 
    dayOffset: 1, 
    startTime: DateTime.now().toFormat('HH:mm'), 
    onList: false,
    duration: 106
  },

  { id: 'getting-started', onList: true, name: 'TO-DO' },
  { id: 'todo-drag', parentID: 'getting-started', onList: true, name: 'Drag me to the calendar' },
  { id: 'todo-photo', parentID: 'getting-started', onList: true, name: 'Attach a photo' },
  { id: 'todo-icon', parentID: 'getting-started', onList: true, name: 'Draw a habit icon',
    notes: 'Create a repeat template, then replace the checkbox with an icon' },
  { id: 'todo-gcal', parentID: 'getting-started', onList: true, name: 'Connect with Google Calendar',
    notes: 'Multiple accounts can be associated' },

  { id: 'visa', onList: true, name: 'Visa timeline', childrenLayout: 'timeline' },
  { id: 'visa-startup', parentID: 'visa', onList: true, name: 'Startup visa', offset: { months: -3 }, isDone: true },
  { id: 'visa-renewal', parentID: 'visa', onList: true, name: 'Visa renewal', offset: { days: 8 } },
  { id: 'visa-manager', parentID: 'visa', onList: true, name: 'Business Manager visa', offset: { months: 11 } },
]

const RRSTR = {
  daily: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU',
  wedWeekly: 'FREQ=WEEKLY;BYDAY=WE',
  sunWeekly: 'FREQ=WEEKLY;BYDAY=SU',
}

const SEED_TEMPLATES = [
  {
    id: 'template-habit-water',
    name: 'Water the plant',
    duration: 15,
    iconURL: ICON.waterPlant,
    isStarred: true,
    rrStr: RRSTR.wedWeekly,
  },
  {
    id: 'template-habit-drink',
    name: 'Drink water',
    duration: 1,
    iconURL: ICON.drinkWater,
    isStarred: true,
    rrStr: RRSTR.daily,
  },
  {
    id: 'template-habit-meditate',
    name: 'Meditate',
    duration: 15,
    iconURL: ICON.meditate,
    isStarred: true,
    rrStr: RRSTR.daily,
  },
  {
    id: 'template-habit-laundry',
    name: 'Dry laundry',
    duration: 10,
    iconURL: ICON.laundry,
    isStarred: true,
    rrStr: RRSTR.sunWeekly,
  }
]
