import { DateTime } from 'luxon'
import { get } from 'svelte/store'
import { writeBatch, doc } from 'firebase/firestore'
import { db } from '$lib/db/init.js'
import Task from '$lib/db/models/Task.js'
import Template from '$lib/db/models/Template.js'
import { user } from '$lib/store'
import { getPreviewSpan } from '$lib/utils/rrule.js'

// A lived-in demo, not a tutorial. Projects, lists, a timeline, and a week
// already on the calendar. Parents are listed before their children.
//
// dayOffset — days from today
// offset — Luxon duration, for dates measured in weeks or months
// hourFromNow — timed event placed relative to the moment the account is
//   created, so the open calendar is full at whatever hour someone arrives
// fixedTime — keep an exact clock time (used for habit history)

export async function initializeSeedData () {
  const prevEndISO = DateTime.utc().minus({ days: 1 }).toFormat('yyyy-MM-dd')
  const uid = get(user).uid
  const batch = writeBatch(db)

  const tasks = buildNodes(resolveRelativeDates([
    ...SEED_TASKS,
    ...pastHabitTasks(prevEndISO),
  ]))

  let order = get(user).maxOrderValue
  for (const node of tasks) {
    order += 1
    const { id, ...data } = node
    batch.set(
      doc(db, `users/${uid}/tasks/${id}`),
      Task.schema.parse({ ...data, orderValue: order })
    )
  }

  for (const habit of Object.values(HABIT)) {
    for (const tmpl of templateDocs(habit, prevEndISO)) {
      order += 1
      batch.set(
        doc(db, `users/${uid}/templates/${tmpl.id}`),
        Template.schema.parse({ ...tmpl.data, orderValue: order })
      )
    }
  }

  batch.update(doc(db, 'users', uid), {
    maxOrderValue: order,
    tags: TAGS,
  })

  await batch.commit()
  user.update(u => ({ ...u, maxOrderValue: order, tags: TAGS }))
}

function resolveRelativeDates (tasks) {
  const now = DateTime.now()
  const busy = new Map()
  blockHabitSlots(busy, now)

  return tasks.map(task => {
    const {
      id,
      dayOffset = null,
      offset = null,
      hourFromNow = null,
      startTime = '',
      fixedTime = false,
      completeIfPast = false,
      ...data
    } = task

    let when = null
    if (hourFromNow != null) {
      when = now.plus({ hours: hourFromNow })
    }
    else if (offset || dayOffset != null) {
      when = now.plus(offset ?? { days: dayOffset })
      if (startTime) {
        const [h, m] = startTime.split(':').map(Number)
        when = when.set({ hour: h, minute: m, second: 0, millisecond: 0 })
      }
    }

    if (when) {
      data.startDateISO = when.toFormat('yyyy-MM-dd')
      const timed = Boolean(startTime) || hourFromNow != null
      if (timed && !fixedTime) {
        const dayOff = Math.round(when.startOf('day').diff(now.startOf('day'), 'days').days)
        const preferred = Math.floor((when.hour * 60 + when.minute) / 15) * 15
        data.startTime = reserve(busy, dayOff, preferred, data.duration ?? 30)
      }
      else if (startTime) {
        data.startTime = startTime
      }
    }

    if (completeIfPast && data.startDateISO && data.startTime) {
      const end = DateTime.fromISO(`${data.startDateISO}T${data.startTime}`)
        .plus({ minutes: data.duration ?? 30 })
      if (end < now) data.isDone = true
    }

    return { id, data }
  })
}

function buildNodes (tasks) {
  const byId = new Map()
  const nodes = []

  for (const { id, data } of tasks) {
    const parentID = data.parentID || ''
    const parent = parentID ? byId.get(parentID) : null
    if (parentID && !parent) throw new Error(`Seed parent missing for ${id}: ${parentID}`)

    const node = {
      ...data,
      id,
      parentID,
      rootID: parent ? parent.rootID : id,
      treeISOs: [],
    }
    byId.set(id, node)
    nodes.push(node)
  }

  const datesByRoot = new Map()
  for (const node of nodes) {
    if (!node.startDateISO) continue
    const dates = datesByRoot.get(node.rootID) ?? []
    if (!dates.includes(node.startDateISO)) dates.push(node.startDateISO)
    datesByRoot.set(node.rootID, dates)
  }
  for (const node of nodes) {
    node.treeISOs = [...(datesByRoot.get(node.rootID) ?? [])]
  }
  return nodes
}

// Recent completions, so the habits tab and the days behind today already
// have a streak. Stops before ExtendRoutines takes over, which starts the
// day after prevEndISO.
function pastHabitTasks (prevEndISO) {
  const today = DateTime.now().startOf('day')
  const extendFrom = DateTime.fromISO(prevEndISO).plus({ days: 1 }).startOf('day')
  const tasks = []

  for (let day = -6; day <= -1; day++) {
    const date = today.plus({ days: day })
    if (date >= extendFrom) continue

    for (const habit of Object.values(HABIT)) {
      if (!onThisWeekday(habit, date.weekday)) continue
      tasks.push(...habitInstance(habit, day))
    }
  }
  return tasks
}

function habitInstance (habit, dayOffset) {
  const id = `${habit.id}-d${Math.abs(dayOffset)}`
  const parent = {
    id,
    name: habit.name,
    duration: habit.duration,
    onList: false,
    isDone: true,
    templateID: habit.id,
    dayOffset,
    ...(habit.iconURL ? { iconURL: habit.iconURL } : {}),
    ...(habit.startMin == null ? {} : {
      startTime: hhmm(habit.startMin),
      fixedTime: true,
    }),
  }
  const children = (habit.children ?? []).map(child => ({
    id: `${id}-${child.id}`,
    parentID: id,
    name: child.name,
    duration: child.duration ?? 15,
    onList: false,
    isDone: true,
    ...(child.iconURL ? { iconURL: child.iconURL } : {}),
  }))
  return [parent, ...children]
}

// Subroutines are child templates. Only the parent recurs; ExtendRoutines
// instantiates the children under each occurrence.
function templateDocs (habit, prevEndISO) {
  const docs = [{
    id: habit.id,
    data: {
      name: habit.name,
      duration: habit.duration,
      ...(habit.iconURL ? { iconURL: habit.iconURL } : {}),
      ...(habit.startMin == null ? {} : { startTime: hhmm(habit.startMin) }),
      isStarred: true,
      rrStr: habit.rrStr,
      rootID: habit.id,
      previewSpan: getPreviewSpan({ rrStr: habit.rrStr }),
      prevEndISO,
    }
  }]
  for (const child of habit.children ?? []) {
    docs.push({
      id: child.id,
      data: {
        name: child.name,
        duration: child.duration ?? 15,
        parentID: habit.id,
        rootID: habit.id,
        isStarred: false,
        ...(child.iconURL ? { iconURL: child.iconURL } : {}),
      }
    })
  }
  return docs
}

function onThisWeekday (habit, weekday) {
  if (habit.weekdays) return habit.weekdays.includes(weekday)
  if (habit.weekday) return habit.weekday === weekday
  return true
}

function blockHabitSlots (busy, now) {
  for (let day = -8; day <= 8; day++) {
    const weekday = now.startOf('day').plus({ days: day }).weekday
    for (const habit of Object.values(HABIT)) {
      if (habit.startMin == null) continue
      if (!onThisWeekday(habit, weekday)) continue
      occupy(busy, day, habit.startMin, habit.duration)
    }
  }
}

function occupy (busy, day, start, duration) {
  const slots = busy.get(day) ?? []
  slots.push({ start, end: start + duration })
  busy.set(day, slots)
}

function reserve (busy, day, preferred, duration) {
  const slots = busy.get(day) ?? []
  busy.set(day, slots)

  let start = Math.max(0, preferred)
  for (let i = 0; i < 48; i++) {
    const blocker = slots.find(slot => start < slot.end && start + duration > slot.start)
    if (!blocker) break
    start = blocker.end
  }
  if (start >= 24 * 60) start = Math.min(Math.max(preferred, 0), 23 * 60)

  slots.push({ start, end: start + duration })
  return hhmm(start)
}

function hhmm (mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const PHOTOS = {
  drawing: 'https://i.imgur.com/Pu7PxCi.jpeg',
  bird: 'https://i.imgur.com/waIioxd.jpeg',
}

const ICON = {
  waterPlant: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FEPtvgSIsPkpznSIffOoa.png?alt=media&token=018a960d-1f76-47eb-a0fe-85c6a5423bd9',
  drinkWater: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2F6w6I9VRWZLRWqphuLgFz.png?alt=media&token=ba68dd3b-83fe-4ed2-bc38-9a2888d31f1b',
  meditate: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FhsCFkECSF4PcFt6MOcW0.png?alt=media&token=d4ed8987-9001-43bc-b48b-4f36caef6fb1',
  tennis: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FKi92VqVTiD3DFJJTfQE4.png?alt=media&token=72b2e519-16ce-44eb-87eb-d74c0df89d00',
  laundry: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2Fk49WsIjV1kQ2e6MW52BR.png?alt=media&token=0d44da5b-dfd7-4ff3-9971-3637b748c6be',
}

const TAGS = {
  ask: { name: 'Ask', color: '#4C7BF4' },
  decide: { name: 'Decide', color: '#E09B2D' },
  errand: { name: 'Errand', color: '#3E9B74' },
}

const RRULE = {
  daily: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU',
  wed: 'FREQ=WEEKLY;BYDAY=WE',
  sun: 'FREQ=WEEKLY;BYDAY=SU',
  mwf: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
}

// weekday: Luxon, Monday = 1 … Sunday = 7. Omitted means every day.
// startMin omitted means the habit sits in the day header, not on the grid.
const HABIT = {
  morning: {
    id: 'template-habit-morning',
    name: 'Morning routine',
    duration: 60,
    startMin: 8 * 60,
    rrStr: RRULE.daily,
    children: [
      { id: 'template-morning-water', name: 'Drink water', duration: 1, iconURL: ICON.drinkWater },
      { id: 'template-morning-meditate', name: 'Meditate', duration: 20, iconURL: ICON.meditate },
      { id: 'template-morning-windows', name: 'Open the windows', duration: 5 },
      { id: 'template-morning-coffee', name: 'Coffee', duration: 10 },
    ],
  },
  tennis: {
    id: 'template-habit-tennis',
    name: 'Tennis',
    duration: 120,
    iconURL: ICON.tennis,
    startMin: 12 * 60,
    weekdays: [1, 3, 5],
    rrStr: RRULE.mwf,
    children: [
      { id: 'template-tennis-card', name: 'Membership card' },
      { id: 'template-tennis-towel', name: 'Towel' },
      { id: 'template-tennis-balls', name: 'Balls' },
    ],
  },
  water: {
    id: 'template-habit-water',
    name: 'Water the plant',
    duration: 15,
    iconURL: ICON.waterPlant,
    startMin: 9 * 60 + 30,
    weekday: 3,
    rrStr: RRULE.wed,
  },
  laundry: {
    id: 'template-habit-laundry',
    name: 'Dry laundry',
    duration: 20,
    iconURL: ICON.laundry,
    startMin: 9 * 60,
    weekday: 7,
    rrStr: RRULE.sun,
  },
}

const SEED_TASKS = [
  // Pinned near "now" so the open hour is already full. Not list columns.
  {
    id: 'photo-bird',
    name: 'Field notes',
    notes: 'The red-crowned one was back.',
    imageDownloadURL: PHOTOS.bird,
    onList: false,
    hourFromNow: 0,
    duration: 90,
  },
  {
    id: 'lunch-alex',
    name: 'Lunch with Alex',
    notes: 'Before the museum.',
    onList: false,
    startTime: '11:00',
    duration: 45,
    dayOffset: 0,
    completeIfPast: true,
  },

  // List columns, in order.
  { id: 'week', onList: true, name: 'This week' },
  { id: 'week-receipt', parentID: 'week', onList: true, name: 'Save the filing receipt', isDone: true },
  {
    id: 'week-lawyer',
    parentID: 'week',
    onList: true,
    name: 'Call Sato about the interview',
    tagIDs: ['errand'],
    hourFromNow: 2,
    duration: 45,
  },
  {
    id: 'week-alex',
    parentID: 'week',
    onList: true,
    name: 'Reply to Alex about the photos',
    tagIDs: ['ask'],
  },
  {
    id: 'week-answers',
    parentID: 'week',
    onList: true,
    name: 'Draft answers for the visa interview',
    dayOffset: 2,
    startTime: '09:30',
    duration: 60,
  },
  {
    id: 'week-build',
    parentID: 'week',
    onList: true,
    name: 'Print the museum tickets',
    dayOffset: 1,
  },

  { id: 'waiting', onList: true, name: 'Waiting on' },
  { id: 'wait-receipt', parentID: 'waiting', onList: true, name: 'Filing receipt' },
  { id: 'wait-alex', parentID: 'waiting', onList: true, name: 'Photos from Alex', tagIDs: ['ask'] },
  { id: 'wait-tax', parentID: 'waiting', onList: true, name: 'Tax return' },
  { id: 'wait-letter', parentID: 'waiting', onList: true, name: 'Consulate letter', tagIDs: ['decide'] },

  { id: 'hold', onList: true, name: 'On hold' },
  { id: 'hold-keyboard', parentID: 'hold', onList: true, name: 'Corne keyboard build' },
  {
    id: 'hold-flight',
    parentID: 'hold',
    onList: true,
    name: 'Discovery flight',
    notes: 'After the visa decision.',
  },
  { id: 'hold-lisbon', parentID: 'hold', onList: true, name: 'Lisbon, 4–18 Apr' },
  { id: 'hold-parser', parentID: 'hold', onList: true, name: 'Rewrite the sync parser' },

  {
    id: 'visa',
    onList: true,
    name: 'Visa',
    childrenLayout: 'timeline',
  },
  {
    id: 'visa-startup',
    parentID: 'visa',
    onList: true,
    name: 'Startup visa',
    offset: { months: -4 },
    isDone: true,
  },
  {
    id: 'visa-interview',
    parentID: 'visa',
    onList: true,
    name: 'Interview',
    offset: { days: 18 },
  },
  {
    id: 'visa-manager',
    parentID: 'visa',
    onList: true,
    name: 'Business manager visa',
    offset: { months: 11 },
  },

  { id: 'mom', onList: true, name: "Mom's visit" },
  {
    id: 'mom-station',
    parentID: 'mom',
    onList: true,
    name: 'Meet the 14:10',
    dayOffset: 2,
    startTime: '14:10',
    fixedTime: true,
    duration: 30,
  },
  {
    id: 'mom-museum',
    parentID: 'mom',
    onList: true,
    name: 'The print museum',
    dayOffset: 3,
    startTime: '11:00',
    duration: 120,
  },
  {
    id: 'mom-home',
    parentID: 'mom',
    onList: true,
    name: 'Sunday train home',
    dayOffset: 4,
    startTime: '16:20',
    fixedTime: true,
    duration: 20,
  },

  { id: 'projects', onList: true, name: 'Projects' },
  { id: 'proj-figure', parentID: 'projects', onList: true, name: 'Figure drawing' },
  { id: 'proj-portuguese', parentID: 'projects', onList: true, name: 'Portuguese' },
  { id: 'proj-book', parentID: 'projects', onList: true, name: 'The photo book' },
  { id: 'proj-letter', parentID: 'projects', onList: true, name: 'Letter to Kenji' },

  {
    id: 'photo-drawing',
    name: 'Drawing block',
    notes: 'An hour on the figure.',
    imageDownloadURL: PHOTOS.drawing,
    onList: false,
    dayOffset: 1,
    startTime: '15:00',
    duration: 90,
  },
  {
    id: 'cal-review',
    name: 'Review with Alex',
    onList: false,
    isDone: true,
    dayOffset: -1,
    startTime: '16:00',
    duration: 60,
  },
  {
    id: 'cal-portal',
    name: 'Check the visa portal',
    onList: false,
    isDone: true,
    dayOffset: 0,
  },
]
