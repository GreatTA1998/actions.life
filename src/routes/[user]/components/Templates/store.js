import { writable, get } from 'svelte/store'
import Template from '/src/lib/db/models/Template'
import { user } from '/src/lib/store/userStore.js'
import '/src/lib/store/themes'

export const templates = writable([])
export const editingTemplateId = writable('')

export function openTemplateEditor(templateId) {
  editingTemplateId.set(templateId)
}

export function closeTemplateEditor() {
  editingTemplateId.set(null)
}

export function deleteTemplate({ templateID }) {
  const currentUser = get(user)
  Template.delete({ id: templateID, userID: currentUser.uid })
  templates.update((templates) => templates.filter((template) => template.id !== templateID))
  closeTemplateEditor()
}

// deprecate updateTemplate
export async function updateTemplate({ templateID, keyValueChanges, oldTemplate }) {
  const newTemplate = buildNewTemplate({ oldTemplate, keyValueChanges })
  Template.schema.parse(newTemplate)
  // TO-DO: rename `templates`
  // replaces the item in the array with the new template
  templates.update(templates => templates.map(template => template.id === templateID ? newTemplate : template))
 
  if (oldTemplate.crontab === '') {
    Template.update({ 
      id: templateID, 
      newTemplate, 
      updates: keyValueChanges, 
      userID: get(user).uid 
    })
  }
  else {
    Template.updateWithTasks({
      userID: get(user).uid,
      id: templateID,
      updates: keyValueChanges,
      newTemplate
    })
  }
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