<div 
  {@attach registerDropzone({ 
    id,
    clipRectFunction: clipRectFunction(),
    onDrop: () => placeOnList({ parentID, rooms: roomsInThisLevel, index: idxInThisLevel })
  })}
  onclick={e => {
    e.stopPropagation();
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
    {$bestDropzoneID === id ? dropPreviewCSS : ''}
    {extraStyle};
  "
></div>

<script>
  import { randomID } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  const { 
    registerDropzone, bestDropzoneID, dropPreviewCSS,
    computeOrderValue, placeOnList
  } = getContext('drag-drop')
  const { dzRootHeight, dzSubHeight, debug, clipRectFunction, rootFontSize, subFontSize } = getContext('list-config')
  const { activateInput, overrideOptions } = getContext('popover-input')

  let {
    roomsInThisLevel,
    idxInThisLevel,
    parentID = '',
    debugColor = 'red',
    extraClass = '',
    extraStyle = ''
  } = $props()

  const id = randomID()
  let anchorID = $derived(`--dropzone-${id}`)
</script>
