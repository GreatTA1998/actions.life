import { DateTime } from 'luxon'
import Task from '$lib/db/models/Task.js'

export async function initializeSeedData () {
  for (const { id, data } of buildSeedTasks()) {
    await Task.create({ id, data, optimistic: false })
  }
}

function buildSeedTasks (entries = SEED_ENTRIES) {
  const today = DateTime.now()
  return entries.map(({ id, dayOffset, ...data }) => {
    if (dayOffset != null) {
      data.startDateISO = today.plus({ days: dayOffset }).toFormat('yyyy-MM-dd')
    }
    return { id, data }
  })
}

const PHOTOS = {
  olaDrawingByDad: 'https://i.imgur.com/mftyC11.jpeg',
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
export const SEED_ENTRIES = [
  { id: 'photo-bird', 
    imageDownloadURL: PHOTOS.redCrownBird, 
    dayOffset: 0, 
    startTime: DateTime.now().toFormat('HH:mm'), 
    onList: false,
    duration: 106
  },
  { id: 'photo-dog', 
    imageDownloadURL: PHOTOS.olaDrawingByDad, 
    dayOffset: 1, 
    startTime: DateTime.now().toFormat('HH:mm'), 
    onList: false,
    duration: 106
  },

  // ── Icon habits ─────────────────────────────────────────────────────
  // Appear as doodle icons in the calendar day header (today).
  { id: 'habit-water',    name: 'Water the plant', iconURL: ICON.waterPlant, dayOffset: 0, onList: false },
  { id: 'habit-drink',    name: 'Drink water',     iconURL: ICON.drinkWater, dayOffset: 0, onList: false },
  { id: 'habit-meditate', name: 'Meditate',        iconURL: ICON.meditate,   dayOffset: 0, onList: false },
  { id: 'habit-laundry',  name: 'Dry laundry',     iconURL: ICON.laundry,    dayOffset: 0, onList: false },

  // ── Timeline ────────────────────────────────────────────────────────
  // Parent lives in the list area; children are spread across dates so
  // toggling to "timeline" layout shows temporal distance between them.
  { id: 'project', name: 'Timeline', childrenLayout: 'timeline', onList: true },
  { id: 'project-draft', name: 'First draft',  parentID: 'project', dayOffset: -30, isDone: true, onList: true },
  { id: 'project-final',   name: 'Final submission',    parentID: 'project', dayOffset: 60,  duration: 120, onList: true },

  // ── Sub-task tree ───────────────────────────────────────────────────
  // A simple parent → children hierarchy visible in the list area.
  { id: 'reading',   name: 'Groceries', onList: true },
  { id: 'reading-1', name: 'Tomato', parentID: 'reading', isDone: true, onList: true },
  { id: 'reading-2', name: 'Eggs', parentID: 'reading', onList: true }
]