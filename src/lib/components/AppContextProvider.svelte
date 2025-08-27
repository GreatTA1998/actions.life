<script>
  import { setContext } from 'svelte'
  import { tasksCache, clickedTaskID, closeTaskPopup, ancestralTree, openTaskPopup, activeDragItem, grabOffset, user, willOpenDatePicker } from '$lib/store'
  import Task from '$lib/db/models/Task.js'
  import Template from '$lib/db/models/Template.js'
  import { writable } from 'svelte/store'

  let { children } = $props()

  const draggedItem = writable({
    x1: null,
    y1: null,
    x2: null,
    y2: null,
    offsetX: null,
    offsetY: null,
    kind: '',
    id: ''
  })
  const matchedDropzones = writable({})
  const bestDropzoneID = writable('')
  const hasDropped = writable(false)
  const scrollCalRect = writable(() => {})
  const logicAreaRect = writable(() => {})

  setContext('app', {
    user,
    Task, 
    Template,
    tasksCache,
    clickedTaskID,
    ancestralTree,
    openTaskPopup,
    closeTaskPopup,
    willOpenDatePicker,
    activeDragItem,
    grabOffset,
    draggedItem,
    hasDropped,
    matchedDropzones,
    bestDropzoneID,
    scrollCalRect,
    logicAreaRect
  })

  function ondragover (e) {
    e.preventDefault() // otherwise drop is disallowed
    e.dataTransfer.dropEffect = 'move' // explicitly define a plain effect. Without it, Mac would show a green + icon which is distracting

    draggedItem.update(i => {
      i.x1 = e.clientX - i.offsetX
      i.y1 = e.clientY - i.offsetY
      i.x2 = i.x1 + i.width
      i.y2 = i.y1 + i.height
      return i
    })

    bestDropzoneID.set(
      resolveBest($matchedDropzones)
    )
  }

  function ondrop (e) {
    e.preventDefault() // prevent the browser navigating to what it thinks is the newly dropped URL. Note web.dev is WRONG using e.stopPropagation() here!
    bestDropzoneID.set(
      resolveBest($matchedDropzones)
    )
    hasDropped.set(true)
  }

  function resolveBest (dropzones) {
    let maxOverlap = 0
    let bestDropzoneID = ''
    for (const [dropzoneID, { area, left }] of Object.entries(dropzones)) {
      const overlap = area
      if (overlap === maxOverlap) {
        if (left > dropzones[bestDropzoneID].left) {
          bestDropzoneID = dropzoneID
        }
      }
      if (overlap > maxOverlap) {
        maxOverlap = overlap
        bestDropzoneID = dropzoneID
      }
    }
    return bestDropzoneID
  }
</script>

<div {ondragover} {ondrop}>
  {@render children()}
</div>