import { buildForest, findSubtree } from '/src/routes/[user]/components/ListsArea/service.js'
import { writable, derived } from 'svelte/store'
import { tasksCache } from './tasksCache.js'

export const clickedTaskID = writable('')

export const ancestralTree = derived(
  [clickedTaskID, tasksCache],
  ([$clickedTaskID, $tasksCache]) => {
    if (!$tasksCache[$clickedTaskID]) return

    const union = buildForest(Object.values($tasksCache).filter(t => !t.isArchived))
    for (const rootTree of union) {
      const result = findSubtree({
        tree: rootTree,
        id: $clickedTaskID
      })
      if (result) return result
    }
  }
)

export function openTaskPopup (task) {
  clickedTaskID.set(task.id)
}

export function closeTaskPopup() {
  clickedTaskID.set('')
}