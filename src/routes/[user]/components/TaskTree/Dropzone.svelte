<div 
  {@attach registerDropzone({ 
    id,
    clipRectFunction: $logicAreaRect, 
    onDrop () {
      if (circular) return

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
  })}
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
    {$bestDropzoneID === id ? (circular ? 'background-color-red;' : dropPreviewCSS ) : ''};
    {extraStyle};
  "
></div>

<script>
  import { getRandomID } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')
  const { 
    registerDropzone, bestDropzoneID, dropPreviewCSS,
    draggedItem, logicAreaRect, computeOrderValue
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
  let anchorID = $derived(`--dropzone-${id}`)
  let circular = $derived(ancestorIDs.includes($draggedItem.id))
</script>