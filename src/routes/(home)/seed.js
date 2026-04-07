import { DateTime } from 'luxon'

const ICON = {
  waterPlant: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FEPtvgSIsPkpznSIffOoa.png?alt=media&token=018a960d-1f76-47eb-a0fe-85c6a5423bd9',
  drinkWater: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2F6w6I9VRWZLRWqphuLgFz.png?alt=media&token=ba68dd3b-83fe-4ed2-bc38-9a2888d31f1b',
  meditate: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FhsCFkECSF4PcFt6MOcW0.png?alt=media&token=d4ed8987-9001-43bc-b48b-4f36caef6fb1',
  laundry: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2Fk49WsIjV1kQ2e6MW52BR.png?alt=media&token=0d44da5b-dfd7-4ff3-9971-3637b748c6be',
}

/**
 * Seed entries for new anonymous users.
 *
 * Shape per entry:
 *   id        – stable document ID
 *   dayOffset – (optional) days from today → becomes startDateISO at build time
 *   ...rest   – fields forwarded as `data` to Task.create()
 *
 * Parents MUST appear before their children (Task.create reads the parent
 * from tasksCache to compute rootID / treeISOs).
 *
 * Only "stable" properties are stored here — fields that are computed at
 * creation time (orderValue, treeISOs, rootID) are intentionally omitted.
 */
export const SEED_ENTRIES = [
  // ── Icon habits ─────────────────────────────────────────────────────
  // Appear as doodle icons in the calendar day header (today).
  { id: 'habit-water',    name: 'Water the plant', iconURL: ICON.waterPlant, dayOffset: 0, onList: false },
  { id: 'habit-drink',    name: 'Drink water',     iconURL: ICON.drinkWater, dayOffset: 0, onList: false },
  { id: 'habit-meditate', name: 'Meditate',        iconURL: ICON.meditate,   dayOffset: 0, onList: false },
  { id: 'habit-laundry',  name: 'Dry laundry',     iconURL: ICON.laundry,    dayOffset: 0, onList: false },

  // ── Scheduled task ──────────────────────────────────────────────────
  // Appears as a block in the calendar time column (today).
  { id: 'morning-run', name: 'Morning run', dayOffset: 0, startTime: '08:30', duration: 45, onList: false },

  // ── Timeline ────────────────────────────────────────────────────────
  // Parent lives in the list area; children are spread across dates so
  // toggling to "timeline" layout shows temporal distance between them.
  { id: 'camino',          name: 'Walk the Camino de Santiago', childrenLayout: 'timeline', onList: true },
  { id: 'camino-research', name: 'Research routes',  parentID: 'camino', dayOffset: -30, isDone: true, onList: true },
  { id: 'camino-train',    name: 'Start training',   parentID: 'camino', dayOffset: -7,  onList: true },
  { id: 'camino-depart',   name: 'Departure day',    parentID: 'camino', dayOffset: 60,  duration: 120, onList: true },

  // ── Sub-task tree ───────────────────────────────────────────────────
  // A simple parent → children hierarchy visible in the list area.
  { id: 'reading',   name: 'Books to read', onList: true },
  { id: 'reading-1', name: 'The Alchemist', parentID: 'reading', isDone: true, onList: true },
  { id: 'reading-2', name: 'Atomic Habits', parentID: 'reading', onList: true },
  { id: 'reading-3', name: 'Sapiens',       parentID: 'reading', onList: true },
]

/**
 * Resolve `dayOffset` → `startDateISO` and return objects shaped for
 * sequential Task.create() calls:
 *
 *   for (const { id, data } of buildSeedTasks()) {
 *     await Task.create({ id, data, optimistic: false })
 *   }
 */
export function buildSeedTasks (entries = SEED_ENTRIES) {
  const today = DateTime.now()
  return entries.map(({ id, dayOffset, ...data }) => {
    if (dayOffset != null) {
      data.startDateISO = today.plus({ days: dayOffset }).toFormat('yyyy-MM-dd')
    }
    return { id, data }
  })
}
