import { writable, get } from 'svelte/store'
import Template from '/src/lib/db/models/Template'
import { user } from '/src/lib/store/userStore.js'
import '/src/lib/store/themes'

export const templates = writable([])

export function deleteTemplate({ templateID }) {
  const currentUser = get(user)
  Template.delete({ id: templateID, userID: currentUser.uid })
  templates.update((templates) => templates.filter((template) => template.id !== templateID))
}

export async function updateTemplate({ templateID, keyValueChanges, oldTemplate }) {
  const currentUser = get(user)
  const newTemplate = buildNewTemplate({ oldTemplate, keyValueChanges })
  Template.schema.parse(newTemplate)
  templates.update((templates) => templates.map((template) =>
    template.id === templateID ? newTemplate : template
  ))
  if (oldTemplate.crontab === '') {
    return updateQuickTasks({ templateID, newTemplate, keyValueChanges, userID: currentUser.uid })
  }
  const hydratedTasks = await Template.updateWithTasks({
    userID: currentUser.uid,
    id: templateID,
    updates: keyValueChanges,
    newTemplate
  })
}

function updateQuickTasks({ templateID, keyValueChanges, userID, newTemplate }) {
  Template.update({ userID, id: templateID, newTemplate, updates: keyValueChanges })
}

function buildNewTemplate({ oldTemplate, keyValueChanges }) {
  const newTemplate = { ...oldTemplate, ...keyValueChanges }
  delete newTemplate.id
  delete newTemplate.userID
  delete newTemplate.totalMinutesSpent
  delete newTemplate.totalTasksCompleted
  Template.schema.parse(newTemplate)
  return newTemplate
} 