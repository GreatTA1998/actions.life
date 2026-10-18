import { DateTime } from 'luxon'
import { get } from 'svelte/store'
import { writeBatch, doc } from 'firebase/firestore'
import { db } from '$lib/db/init.js'
import Task from '$lib/db/models/Task.js'
import Template from '$lib/db/models/Template.js'
import { user } from '$lib/store'
import { getPreviewSpan } from '$lib/utils/rrule.js'

// A lived-in demo, not a tutorial. Lists, a move-out timeline, and a week
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
// day after prevEndISO. Local today is included when it is still before that
// UTC window, which is the evening in timezones behind UTC.
function pastHabitTasks (prevEndISO) {
  const today = DateTime.now().startOf('day')
  const extendFrom = DateTime.fromISO(prevEndISO).plus({ days: 1 }).startOf('day')
  const tasks = []

  for (let day = -6; day <= 0; day++) {
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
  sunshine: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FCnlRA192arXwsa22WvW2.png?alt=media&token=17eb90b3-a5a5-425f-a404-9e71d570807e',
  drinkWater: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2F6w6I9VRWZLRWqphuLgFz.png?alt=media&token=ba68dd3b-83fe-4ed2-bc38-9a2888d31f1b',
  meditate: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FhsCFkECSF4PcFt6MOcW0.png?alt=media&token=d4ed8987-9001-43bc-b48b-4f36caef6fb1',
  sleep: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FokvcBPH3FoPiRhoP8eFQ.png?alt=media&token=31900fd0-d6bc-4ee4-a35d-f33a0764ebe0',
  appleWatch: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2Fq4EGoQa0U51bUPHP3Akh.png?alt=media&token=7f2d39a8-d4f9-4b54-b3c3-129c2c62a637',
  tennis: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FKi92VqVTiD3DFJJTfQE4.png?alt=media&token=72b2e519-16ce-44eb-87eb-d74c0df89d00',
  laundry: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2Fk49WsIjV1kQ2e6MW52BR.png?alt=media&token=0d44da5b-dfd7-4ff3-9971-3637b748c6be',
  messages: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2Fnchecoybcbh9dLcs5NBd.png?alt=media&token=73fb2466-d992-45e0-a25a-645ca050400d',
}

const TAGS = {
  critical: { name: 'Critical', color: '#4C7BF4' },
}

const RRULE = {
  daily: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU',
  sun: 'FREQ=WEEKLY;BYDAY=SU',
  friSun: 'FREQ=WEEKLY;BYDAY=FR,SU',
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
      { id: 'template-morning-sky', name: 'Look at the sky', duration: 5, iconURL: ICON.sunshine },
      { id: 'template-morning-water', name: 'Drink water', duration: 1, iconURL: ICON.drinkWater },
    ],
  },
  bedtime: {
    id: 'template-habit-bedtime',
    name: 'Bedtime routine',
    duration: 60,
    iconURL: ICON.sleep,
    startMin: 21 * 60,
    rrStr: RRULE.daily,
    children: [
      { id: 'template-bedtime-meditate', name: 'Meditate', duration: 20, iconURL: ICON.meditate },
      { id: 'template-bedtime-watch', name: 'Apple Watch', duration: 5, iconURL: ICON.appleWatch },
    ],
  },
  tennis: {
    id: 'template-habit-tennis',
    name: 'Tennis',
    duration: 60,
    iconURL: ICON.tennis,
    startMin: 13 * 60,
    weekdays: [5, 7],
    rrStr: RRULE.friSun,
    children: [
      { id: 'template-tennis-card', name: 'Membership card' },
      { id: 'template-tennis-towel', name: 'Towel' }
    ],
  },
  laundry: {
    id: 'template-habit-laundry',
    name: 'Laundry',
    duration: 20,
    iconURL: ICON.laundry,
    weekday: 7,
    rrStr: RRULE.sun,
  },
}

const SEED_TASKS = [
  { id: 'week', onList: true, name: 'This week' },
  { id: 'week-odyssey', parentID: 'week', onList: true, name: 'Watch The Odyssey' },
  { id: 'week-dolittle', parentID: 'week', onList: true, name: 'Read Great Expectations' },
  { id: 'week-taxes', parentID: 'week', onList: true, name: 'File taxes (form 1120)' },

  { id: 'waiting', onList: true, name: 'Waiting on' },
  {
    id: 'wait-housing',
    parentID: 'waiting',
    onList: true,
    name: 'Housing confirmation',
    tagIDs: ['critical'],
  },

  { id: 'engine', onList: true, name: 'Engine project' },
  { id: 'engine-v0', parentID: 'engine', onList: true, name: 'Build v0' },
  { id: 'engine-friends', parentID: 'engine', onList: true, name: 'Show it to friends' },
  { id: 'engine-v1', parentID: 'engine', onList: true, name: 'Finalize v1' },

  {
    id: 'move-out',
    onList: true,
    name: 'Visa timeline',
    childrenLayout: 'timeline',
  },
  {
    id: 'move-form',
    parentID: 'move-out',
    onList: true,
    name: 'Submit move-out form',
    offset: { months: -3 },
    isDone: true,
  },
  {
    id: 'move-visa',
    parentID: 'move-out',
    onList: true,
    name: 'Visa expires',
    dayOffset: 7,
  },
  {
    id: 'move-japan',
    parentID: 'move-out',
    onList: true,
    name: 'Visit New York',
    offset: { months: 1 },
  },

  { id: 'hold', onList: true, name: 'On hold' },
  { id: 'hold-cooking', parentID: 'hold', onList: true, name: 'Sign up for cooking class' },
  { id: 'hold-language', parentID: 'hold', onList: true, name: 'Learn new language' },
  { id: 'hold-youtube', parentID: 'hold', onList: true, name: 'Youtube channel' },

  {
    id: 'cal-portal',
    name: 'Check the visa portal',
    onList: false,
    isDone: true,
    dayOffset: 0,
  },
  {
    id: 'cal-messages',
    name: 'Reply to messages',
    iconURL: ICON.messages,
    onList: false,
    dayOffset: 0,
    startTime: '11:00',
    duration: 30,
  },
  {
    id: 'photo-zoo',
    name: 'Visit the zoo',
    imageDownloadURL: PHOTOS.bird,
    onList: false,
    dayOffset: 0,
    startTime: '13:00',
    duration: 90,
  },
  {
    id: 'photo-drawing',
    name: 'Practice drawing',
    imageDownloadURL: PHOTOS.drawing,
    onList: false,
    dayOffset: 1,
    startTime: '11:00',
    duration: 90,
  },
]
