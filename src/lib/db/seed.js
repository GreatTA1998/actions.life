import { DateTime } from 'luxon'
import Task from '$lib/db/models/Task.js'
import Template from '$lib/db/models/Template.js'
import { updateCache } from '$lib/store/tasksCache.js'

export async function initializeSeedData () {
  for (const { id, ...data } of SEED_TEMPLATES) { // parallelizable
    Template.create({ id, data })
  }

  for (const { id, data } of resolveRelativeDates(SEED_TASKS)) { // must be sequential for `treeISOs` to be handled
    const result = await Task.create({ id, data, optimistic: false })
    updateCache([result])
  }
}

function resolveRelativeDates (tasks) {
  const today = DateTime.now()
  return tasks.map(({ id, dayOffset, ...data }) => {
    if (dayOffset != null) {
      data.startDateISO = today.plus({ days: dayOffset }).toFormat('yyyy-MM-dd')
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
 * Shape per entry:
 *   id        – stable document ID
 *   dayOffset – (optional) days from today → becomes startDateISO at build time
 *
 * Parents MUST appear before their children (Task.create reads the parent
 * from tasksCache to compute rootID / treeISOs).
 *
 * Only "stable" properties are stored here — fields that are computed at
 * creation time (orderValue, treeISOs, rootID) are intentionally omitted.
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
    name: 'Drawing event',
    imageDownloadURL: PHOTOS.olaDrawingByDad, 
    dayOffset: 1, 
    startTime: DateTime.now().toFormat('HH:mm'), 
    onList: false,
    duration: 106
  },

  // ── Icon habits ─────────────────────────────────────────────────────
  // day 1
  { id: 'habit-water',    name: 'Water the plant',               iconURL: ICON.waterPlant, dayOffset: 0, onList: false, templateID: 'template-habit-water' },
  { id: 'habit-drink',    name: 'Drink water',     isDone: true, iconURL: ICON.drinkWater, dayOffset: 0, onList: false, templateID: 'template-habit-drink', duration: 1 },
  { id: 'habit-meditate', name: 'Meditate',                      iconURL: ICON.meditate,   dayOffset: 0, onList: false, templateID: 'template-habit-meditate' },
  { id: 'habit-laundry',  name: 'Dry laundry',     isDone: true, iconURL: ICON.laundry,    dayOffset: 0, onList: false, templateID: 'template-habit-laundry' },
  // day 2
  { id: 'habit-drink-2',    name: 'Drink water',     isDone: true, iconURL: ICON.drinkWater, dayOffset: 1, onList: false, templateID: 'template-habit-drink', duration: 1 },
  { id: 'habit-meditate-2', name: 'Meditate',                      iconURL: ICON.meditate,   dayOffset: 1, onList: false, templateID: 'template-habit-meditate' },

  // ── Sub-task tree ───────────────────────────────────────────────────
  { id: 'getting-started', onList: true, name: 'TO-DO' },
  { id: '1', parentID: 'getting-started', onList: true, name: 'Drag me anywhere' },
  { id: '2', parentID: 'getting-started', onList: true, name: 'Create a task (hint: indentation matters)' },
  { id: '3', parentID: 'getting-started', onList: true, name: 'Settings > "Structured Mode"'},

  // ── Timeline ────────────────────────────────────────────────────────
  { id: 'project', name: 'Example Project', childrenLayout: 'timeline', onList: true },
  { id: 'project-draft', name: 'First draft',  parentID: 'project', dayOffset: -30, isDone: true, onList: true },
  { id: 'project-final',   name: 'Final submission',    parentID: 'project', dayOffset: 90,  duration: 120, onList: true }
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