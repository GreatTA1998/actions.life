<div 
  bind:this={dropzoneElem}
  onclick={e => {
    e.stopPropagation(); // since dropzones stack
    activateInput({
      anchorID,
      modifiers: {
        persistsOnList: true,
        orderValue: computeOrderValue(),
        parentID
      }
    })
  }}
  class="{extraClass} select-none"
  style="
    {extraStyle};
    anchor-name: {anchorID};
    min-width: {minWidth()};
    height: {parentID === '' ? dzRootHeight() : dzSubHeight()}; 
    border-radius: var(--left-padding);
    border: 0px solid {colorForDebugging}; 
    {$bestDropzoneID === id ? dropPreviewCSS : ''}
    {$bestDropzoneID === id && isInvalidDrop ? 'background-color: red;' : ''}
  "
></div>

<script>
  import { getRandomID } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')
  const { 
    draggedItem, logicAreaRect, detectOverlap, 
    bestDropzoneID,  dropPreviewCSS, hasDropped, resetDragDrop,
  } = getContext('drag-drop')
  const { dzRootHeight, dzSubHeight, minWidth } = getContext('list-config')
  const { activateInput } = getContext('popover-input')

  let {
    ancestorIDs,
    roomsInThisLevel,
    idxInThisLevel,
    parentID = '',
    colorForDebugging = 'red',
    extraClass = '',
    extraStyle = ''
  } = $props()

  const id = getRandomID()
  
  let dropzoneElem = $state(null)
  let n = $derived(roomsInThisLevel.length)
  let anchorID = $derived(`--dropzone-${id}`)
  let isInvalidDrop = $derived(ancestorIDs.includes($draggedItem.id))

  $effect(() => {
    if ($draggedItem && dropzoneElem) {
      detectOverlap({
        dropzoneElem,
        clipRect: $logicAreaRect(),
        dropzoneID: id
      })
    }
  })

  $effect(() => {
    if ($hasDropped && $bestDropzoneID === id) {
      onDrop()
    }
  })
 
  async function onDrop () {
    dropzoneElem.style.background = ''

    if (isInvalidDrop) {
      resetDragDrop()
      return
    }
    
    const invalids = roomsInThisLevel.filter(task => !task.orderValue)
    if (invalids.length > 0) {
      const errorMessage = `${invalids.length} of the task(s) in the target list has no proper orderValue, aborting drop operation and sending error to the developer`
      alert(errorMessage)
      resetDragDrop()
      throw new Error(errorMessage) // triggers window.onunhandledrejection which emails me
    }

    const keyValueChanges = {
      parentID,
      orderValue: computeOrderValue(),
      persistsOnList: true, // non-persistent rooms, once dragged to the list, becomes persistent. very important, otherwise any node could disappear from the complex task structure just because it's scheduled, some day.
      isArchived: false // otherwise dragging an archived calendar task to the list will cause it to disappear completely
    }
    Task.update({ 
      id: $draggedItem.id, 
      keyValueChanges
    })

    resetDragDrop()
  }

  function computeOrderValue () {
    const k = 1
    const i = idxInThisLevel
    const rooms = roomsInThisLevel

    let newVal
    if (i === 0) {
      const top = rooms[0]
      if (top) newVal = top.orderValue / 1.1 // 1.1 slows down the approach to 0
      else newVal = k // you're dragging a new subtask into a parent that previously had ZERO children, which is valid
    }
    else if (i === n) {
      const bottom = rooms[n-1] 
      newVal = bottom.orderValue + k // Task.js will handle `maxOrderValue`
    }
    else {
      const above = rooms[i-1]
      const below = rooms[i]
      newVal = (above.orderValue + below.orderValue) / 2
    }
    return newVal
  }
</script>