import { writable, get } from 'svelte/store'
import Templates from '../back-end/Templates/index.js'
import { DateTime } from 'luxon'
import { deleteFromLocalState, updateLocalState } from '../helpers/maintainState.js';
import Joi from 'joi';
import TemplateSchema from '../back-end/Schemas/TemplateSchema.js';
import { user, calendarTasks } from './index.js'
import './themes'

export const templates = writable([])

export function deleteTemplate({ templateID }) {
  const currentUser = get(user)
  Templates.deleteTemplate({ id: templateID, userID: currentUser.uid })
  templates.update((templates) => templates.filter((template) => template.id !== templateID))
  deleteFutureTasksLocally(templateID)
}

export async function updateTemplate({ templateID, keyValueChanges, oldTemplate }) {
  const currentUser = get(user);
  const newTemplate = buildNewTemplate({ oldTemplate, keyValueChanges })
  Joi.assert(newTemplate, TemplateSchema);
  templates.update((templates) => templates.map((template) =>
    template.id === templateID ? newTemplate : template
  ))
  if (oldTemplate.crontab === '') {
    return updateQuickTasks({ templateID, newTemplate, keyValueChanges, userID: currentUser.uid });
  }
  const hydratedTasks = await Templates.updateWithTasks({
    userID: currentUser.uid,
    id: templateID,
    updates: keyValueChanges,
    newTemplate
  })

  
  if (keyValueChanges.crontab) {
    deleteFutureTasksLocally(templateID)
    postFutureTasksLocally(hydratedTasks)
  }
  const afterNow = (taskISO) => taskISO > DateTime.now().toISO();
  const tasksToUpdate = get(calendarTasks).filter(task => task.templateID === templateID && afterNow(fullISODate(task)))
  tasksToUpdate.forEach(({ id }) => updateLocalState({ id, keyValueChanges }));
}

function updateQuickTasks({ templateID, keyValueChanges, userID, newTemplate }) {
  Templates.update({ userID, id: templateID, newTemplate, updates: keyValueChanges })
  const tasksToUpdate = get(calendarTasks).filter(task => task.templateID === templateID)
  tasksToUpdate.forEach(({ id }) => updateLocalState({ id, keyValueChanges }));
}

function buildNewTemplate({ oldTemplate, keyValueChanges }) {
  const newTemplate = { ...oldTemplate, ...keyValueChanges }
  delete newTemplate.id
  delete newTemplate.userID
  delete newTemplate.totalMinutesSpent
  delete newTemplate.totalTasksCompleted
  Joi.assert(newTemplate, TemplateSchema);
  return newTemplate
}

function deleteFutureTasksLocally(templateID) {
  const afterNow = (taskISO) => taskISO > DateTime.now().toISO();
  const tasksToDelete = get(calendarTasks).filter(task => task.templateID === templateID && afterNow(fullISODate(task)))
  tasksToDelete.forEach(deleteFromLocalState);
}

const postFutureTasksLocally = (hydratedTasks) => {
  calendarTasks.update((calendarTasks) => [...calendarTasks, ...hydratedTasks])
}

function fullISODate({ startDateISO, startTime }) {
  return DateTime.fromISO(`${startDateISO}T${startTime || '23:59'}:00`).toISO()
}