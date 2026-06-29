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
    },
    normalizeDragItemHeight: true
  })}
  onclick={e => {
    e.stopPropagation(); // since dropzones stack
    activateInput({
      anchorID,
      modifiers: {
        onList: true,
        orderValue: computeOrderValue(idxInThisLevel, roomsInThisLevel),
        parentID
      },
      onCreate () {
        overrideOptions.set({
          ...$overrideOptions,
          orderValue: computeOrderValue(idxInThisLevel, roomsInThisLevel)
        })
      }
    })
  }}
  class="select-none {extraClass}"
  style="
    anchor-name: {anchorID};
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
  const { dzRootHeight, dzSubHeight, debug } = getContext('list-config')
  const { activateInput, overrideOptions } = getContext('popover-input')

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