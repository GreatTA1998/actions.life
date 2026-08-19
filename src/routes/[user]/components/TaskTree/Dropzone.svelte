<div 
  {@attach registerDropzone({ 
    id,
    clipRectFunction: clipRectFunction(),
    ignoreIf: circular,
    onDrop () {
      if (circular()) return
      return Task.update({
        id: $draggedItem.id,
        kvChanges: {
          parentID,
          orderValue: computeOrderValue(idxInThisLevel, roomsInThisLevel),
          onList: true,
          ...($draggedItem.from !== DragFrom.ListArea ? { startTime: '', startDateISO: '' } : {})
        }
      })
    }
  })}
  onclick={e => {
    e.stopPropagation(); // since dropzones stack
    activateInput({
      anchorID,
      fontSize: parentID === '' ? rootFontSize() : subFontSize(),
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
    {$bestDropzoneID === id ? (circular() ? 'background-color: red;' : dropPreviewCSS ) : ''}
    {extraStyle};
  "
></div>

<script>
  import { randomID } from '$lib/utils/core.js'
  import { DragFrom } from '$lib/utils/constants.js'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')
  const { 
    registerDropzone, bestDropzoneID, dropPreviewCSS,
    draggedItem, computeOrderValue
  } = getContext('drag-drop')
  const { dzRootHeight, dzSubHeight, debug, clipRectFunction, rootFontSize, subFontSize } = getContext('list-config')
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

  function circular () {
    return ancestorIDs.includes($draggedItem.id)
  }
</script>