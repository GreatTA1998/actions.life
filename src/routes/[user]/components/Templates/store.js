import { writable, derived, get } from 'svelte/store'

export const popup = writable(false)
export const template = writable(null)
export const templates = writable([])
export const editingTemplateId = writable('')

export function openTemplateEditor(templateId) {
  editingTemplateId.set(templateId)
  popup.set(true)
}

export function closeTemplateEditor() {
  popup.set(false)
}

// Ensure template is updated when editingTemplateId changes
derived([editingTemplateId, templates], ([$editingTemplateId, $templates]) => {
  if ($editingTemplateId) {
    const foundTemplate = $templates.find(t => t.id === $editingTemplateId)
    if (foundTemplate) {
      template.set(foundTemplate)
    }
  } else {
    // Don't clear template when closing to prevent UI flicker
  }
}).subscribe(() => {}) // Subscribe to activate the store