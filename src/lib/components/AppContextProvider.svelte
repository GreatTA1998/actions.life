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
    draggedItem
  })

  function ondragover (e) {
    console.log('update positioning =', e.clientX, e.clientY)

    draggedItem.update(i => {
      i.x1 = e.clientX - i.offsetX
      i.y1 = e.clientY - i.offsetY
      i.x2 = i.x1 + i.width
      i.y2 = i.y1 + i.height
      return i
    })
  }

  function ondrop (e) {
    console.log('drop detected on app context')
  }
</script>

<div {ondragover} {ondrop}>
  {@render children()}
</div>