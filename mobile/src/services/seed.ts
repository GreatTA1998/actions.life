import { addDaysISO, addMonthsISO, nowHM, todayISO } from '../dates';
import type { TaskTreeStore } from './taskStore';

export const HABIT_TEMPLATES = [
  { id: 'template-habit-water', name: 'Water the plant', duration: 15, rr: 'Weekly on Wednesday' },
  { id: 'template-habit-drink', name: 'Drink water', duration: 1, rr: 'Every day' },
  { id: 'template-habit-meditate', name: 'Meditate', duration: 15, rr: 'Every day' },
  { id: 'template-habit-laundry', name: 'Dry laundry', duration: 10, rr: 'Weekly on Sunday' },
] as const;

const PHOTOS = {
  olaDrawingByDad: 'https://i.imgur.com/Pu7PxCi.jpeg',
  redCrownBird: 'https://i.imgur.com/waIioxd.jpeg',
};

export async function insertGuestSeed(store: TaskTreeStore): Promise<void> {
  const today = todayISO();
  const time = nowHM();

  await store.create({
    id: 'photo-bird',
    name: 'Bird-watching with family',
    imageDownloadURL: PHOTOS.redCrownBird,
    startDateISO: today,
    startTime: time,
    onList: false,
    duration: 106,
    isDone: true,
  });
  await store.create({
    id: 'photo-dog',
    name: 'Drawing with friends',
    imageDownloadURL: PHOTOS.olaDrawingByDad,
    startDateISO: addDaysISO(today, 1),
    startTime: time,
    onList: false,
    duration: 106,
  });

  await store.create({ id: 'getting-started', name: 'TO-DO', onList: true });
  await store.create({
    id: 'todo-drag',
    name: 'Drag me to the calendar',
    parentID: 'getting-started',
    onList: true,
  });
  await store.create({
    id: 'todo-photo',
    name: 'Attach a photo',
    parentID: 'getting-started',
    onList: true,
  });
  await store.create({
    id: 'todo-icon',
    name: 'Draw a habit icon',
    parentID: 'getting-started',
    onList: true,
    notes: 'Create a repeat template, then replace the checkbox with an icon',
  });
  await store.create({
    id: 'todo-gcal',
    name: 'Connect with Google Calendar',
    parentID: 'getting-started',
    onList: true,
    notes: 'Multiple accounts can be associated',
  });

  await store.create({
    id: 'visa',
    name: 'Visa timeline',
    onList: true,
    childrenLayout: 'timeline',
  });
  await store.create({
    id: 'visa-startup',
    name: 'Startup visa',
    parentID: 'visa',
    onList: true,
    startDateISO: addMonthsISO(today, -3),
    isDone: true,
  });
  await store.create({
    id: 'visa-renewal',
    name: 'Visa renewal',
    parentID: 'visa',
    onList: true,
    startDateISO: addDaysISO(today, 8),
  });
  await store.create({
    id: 'visa-manager',
    name: 'Business Manager visa',
    parentID: 'visa',
    onList: true,
    startDateISO: addMonthsISO(today, 11),
  });
}
