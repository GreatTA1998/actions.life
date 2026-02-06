import { buildForest, findSubtree } from '/src/routes/[user]/components/ListsArea/service.js'
import { writable, derived } from 'svelte/store'
import { tasksCache } from './tasksCache.js'

export const clickedTaskID = writable('')

export const ancestralTree = derived(
  [clickedTaskID, tasksCache],
  ([$clickedTaskID, $tasksCache]) => {
    if (!$tasksCache[$clickedTaskID]) return

    const union = buildForest(Object.values($tasksCache)) // calendar's query includes archived tasks
    for (const rootTree of union) {
      const result = findSubtree({
        tree: rootTree,
        id: $clickedTaskID
      })
      if (result) {
        // note: newly archived nodes are not removed from cache, so can still appear
        // though at some point this seems like a more fundamental design flaw with the archiving system
        pruneArchivedNodes(result)
        return result
      }
    }
  }
)

function pruneArchivedNodes (tree) {
  tree.children = tree.children.filter(child => !child.isArchived)
  for (const child of tree.children) {
    pruneArchivedNodes(child)
  }
}

export function openTaskPopup (task) {
  clickedTaskID.set(task.id)
}

export function closeTaskPopup() {
  clickedTaskID.set('')
}