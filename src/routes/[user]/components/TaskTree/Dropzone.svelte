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
          onList: true
        }
      })
    }
  })}
  onclick={e => {
    e.stopPropagation(); // since dropzones stack
    activateInput({
      anchorID,
      modifiers: {
        onList: true,
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
    {$bestDropzoneID === id ? (circular ? 'background-color: red;' : dropPreviewCSS ) : ''}
    {extraStyle};
  "
></div>

<script>
  import { randomID } from '$lib/utils/core.js'
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

  const id = randomID()
  let anchorID = $derived(`--dropzone-${id}`)
  let circular = $derived(ancestorIDs.includes($draggedItem.id))
</script>