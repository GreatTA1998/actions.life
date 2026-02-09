<div 
  bind:this={dropzoneElem}
  onclick={e => {
    e.stopPropagation(); // since dropzones stack
    activateInput({
      anchorID,
      modifiers: {
        persistsOnList: true,
        orderValue: computeOrderValue(idxInThisLevel, roomsInThisLevel),
        parentID
      }
    })
  }}
  class="select-none {extraClass}"
  style="
    anchor-name: {anchorID};
    min-width: {minWidth()};
    height: {parentID === '' ? dzRootHeight() : dzSubHeight()}; 
    border-radius: var(--left-padding);
    border: {debug() ? 1 : 0}px solid {debugColor}; 
    {$bestDropzoneID === id ? dropPreviewCSS : ''}
    {$bestDropzoneID === id && circular ? 'background-color: red;' : ''};
    {extraStyle};
  "
></div>

<script>
  import { getRandomID } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')
  const { 
    draggedItem, logicAreaRect, detectOverlap, 
    bestDropzoneID,  dropPreviewCSS, hasDropped, resetDragDrop,
    computeOrderValue
  } = getContext('drag-drop')
  const { dzRootHeight, dzSubHeight, minWidth, debug } = getContext('list-config')
  const { activateInput } = getContext('popover-input')

  let {
    ancestorIDs,
    roomsInThisLevel,
    idxInThisLevel,
    parentID = '',
    debugColor = 'red',
    extraClass = '',
    extraStyle = ''
  } = $props()

  const id = getRandomID()
  
  let dropzoneElem = $state(null)
  let anchorID = $derived(`--dropzone-${id}`)
  let circular = $derived(ancestorIDs.includes($draggedItem.id))

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
    if (!circular) {
      Task.update({ 
        id: $draggedItem.id, 
        kvChanges: {
          parentID,
          orderValue: computeOrderValue(idxInThisLevel, roomsInThisLevel),
          persistsOnList: true, // non-persistent rooms, once dragged to the list, becomes persistent. Otherwise any node could disappear from the complex task structure just because it's scheduled, some day.
          isArchived: false // otherwise dragging an archived calendar task to the list will cause it to disappear completely
        }
      })
    }

    dropzoneElem.style.background = ''
    resetDragDrop()
  }
</script>