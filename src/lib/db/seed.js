import { DateTime } from 'luxon'
import { get } from 'svelte/store'
import Template from '$lib/db/models/Template.js'
import { user } from '$lib/store'
import { getPreviewSpan } from '$lib/utils/rrule.js'
import { writeBatch, doc } from 'firebase/firestore'
import { db } from '$lib/db/init.js'

export async function initializeSeedData () {
  const prevEndISO = DateTime.utc().minus({ days: 1 }).toFormat('yyyy-MM-dd')
  const currentUser = get(user)

  // Start template creation in parallel
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

  // Pre-compute all task data with treeISOs in a single pass
  const resolvedTasks = resolveRelativeDates(SEED_TASKS)
  const tasksById = new Map()
  let maxOrderValue = currentUser.maxOrderValue

  // First pass: create all task objects with basic fields
  for (const { id, data } of resolvedTasks) {
    maxOrderValue += 1
    tasksById.set(id, {
      id,
      name: data.name || '',
      duration: data.duration ?? 30,
      parentID: data.parentID || '',
      startTime: data.startTime || '',
      startDateISO: data.startDateISO || '',
      iconURL: data.iconURL || '',
      timeZone: data.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      notes: data.notes || '',
      templateID: data.templateID || '',
      isDone: data.isDone ?? false,
      imageDownloadURL: data.imageDownloadURL || '',
      imageFullPath: data.imageFullPath || '',
      childrenLayout: data.childrenLayout || 'normal',
      photoLayout: data.photoLayout || 'split-view',
      isCollapsed: data.isCollapsed ?? false,
      onList: data.onList ?? false,
      orderValue: maxOrderValue,
      treeISOs: [],
      rootID: '',
      tagIDs: []
    })
  }

  // Second pass: compute rootID based on parent relationships
  for (const task of tasksById.values()) {
    if (!task.parentID) {
      task.rootID = task.id
    } else {
      const parent = tasksById.get(task.parentID)
      task.rootID = parent.rootID
      task.tagIDs = [...parent.tagIDs]
    }
  }

  // Third pass: collect all dates in each tree and update all family members
  const treesByRoot = new Map()
  for (const task of tasksById.values()) {
    if (!treesByRoot.has(task.rootID)) {
      treesByRoot.set(task.rootID, [])
    }
    treesByRoot.get(task.rootID).push(task)
  }

  // For each tree, collect all dates and update all members
  for (const treeMembers of treesByRoot.values()) {
    const allDates = []
    for (const member of treeMembers) {
      if (member.startDateISO) {
        allDates.push(member.startDateISO)
      }
    }
    // Update all members with the complete date set
    for (const member of treeMembers) {
      member.treeISOs = allDates
    }
  }

  // Batch write all tasks in a single commit
  const batch = writeBatch(db)
  for (const task of tasksById.values()) {
    const taskData = {
      name: task.name || '',
      duration: task.duration ?? 30,
      parentID: task.parentID || '',
      startTime: task.startTime || '',
      startDateISO: task.startDateISO || '',
      iconURL: task.iconURL || '',
      timeZone: task.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      notes: task.notes || '',
      templateID: task.templateID || '',
      isDone: task.isDone ?? false,
      imageDownloadURL: task.imageDownloadURL || '',
      imageFullPath: task.imageFullPath || '',
      childrenLayout: task.childrenLayout || 'normal',
      photoLayout: task.photoLayout || 'split-view',
      isCollapsed: task.isCollapsed ?? false,
      tagIDs: task.tagIDs || [],
      onList: task.onList ?? false,
      orderValue: task.orderValue,
      treeISOs: task.treeISOs || [],
      rootID: task.rootID || ''
    }
    batch.set(doc(db, `users/${currentUser.uid}/tasks/${task.id}`), taskData)
  }

  // Update user's maxOrderValue
  batch.update(doc(db, `users/${currentUser.uid}`), { maxOrderValue })

  // Execute batch write and wait for templates
  await Promise.all([batch.commit(), templates])

  // Update local user store
  user.update(u => ({ ...u, maxOrderValue }))

  // Return seed data for immediate UI hydration
  return Array.from(tasksById.values())
}

function resolveRelativeDates (tasks) {
  const today = DateTime.now()
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