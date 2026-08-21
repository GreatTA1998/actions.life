import { DateTime } from 'luxon'
import Task from '$lib/db/models/Task.js'
import Template from '$lib/db/models/Template.js'
import { getPreviewSpan } from '$lib/utils/rrule.js'

export async function initializeSeedData () {
  const prevEndISO = DateTime.utc().minus({ days: 1 }).toFormat('yyyy-MM-dd')

  const templates = Promise.all(SEED_TEMPLATES.map(({ id, ...data }) =>
    Template.create({
      id,
      data: {
        ...data,
        previewSpan: getPreviewSpan({ rrStr: data.rrStr }),
        prevEndISO
      }
    })
  ))

  for (const { id, data } of resolveRelativeDates(SEED_TASKS)) { // must be sequential for `treeISOs` to be handled
    await Task.create({ id, data })
  }

  await templates
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
 * Parents MUST appear before their children (Task.create reads the parent rootID and treeISOs)
 *
 * Only "stable" properties are stored here — fields that are computed at
 * creation time (orderValue, treeISOs, rootID) are intentionally omitted.
 * 
 * dayOffset – (optional) days from today, becomes startDateISO at build time
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

  { id: 'goal', parentID: 'getting-started', onList: true, name: 'Set a medium-term goal', childrenLayout: 'timeline' },
  { id: 'goal-m1', parentID: 'goal', onList: true, name: 'Milestone 1', dayOffset: -30, isDone: true },
  { id: 'goal-m2', parentID: 'goal', onList: true, name: 'Milestone 2', dayOffset: 90 },

  { id: 'draw-icon', parentID: 'getting-started', onList: true, name: 'Draw your own habit icon' },
  { id: 'draw-icon-repeat', parentID: 'draw-icon', onList: true, name: 'Make a task repeat' },
  { id: 'draw-icon-set', parentID: 'draw-icon', onList: true, name: 'Set an icon' },

  { id: 'upload-photo', parentID: 'getting-started', onList: true, name: 'Upload a photo with friends' },
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