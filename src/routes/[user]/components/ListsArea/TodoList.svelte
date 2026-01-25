<script>
  import AnimationDiv from './AnimationDiv.svelte'
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import { HEIGHTS, WIDTHS } from '$lib/utils/constants.js'
  import { activateInput } from '$lib/store/popoverInput.js'
  import { setContext } from 'svelte'

  let {
    cssStyle,
    listWidth,
    isLargeFont = false,
    trees = null,
    parentID = ''
  } = $props()

  const anchorID = '--dropzone-root-last'
  const padding = 6

  // scaled units
  const scale = $derived(isLargeFont ? 2 : 1)
  const dzRootRemHeight = $derived((parentID ? HEIGHTS.ROOT_DROPZONE : HEIGHTS.SUB_DROPZONE) * scale)
  const dzSubRemHeight = $derived(HEIGHTS.SUB_DROPZONE * scale)
  const rootFontSize = $derived(1 * scale) // rem =  16px / 32px
  const subFontSize = $derived(0.875 * scale) // rem = 14px / 28px

  setContext('list-config', { 
    indent: WIDTHS.INDENT_PER_LEVEL, 
    dzRootRemHeight: () => dzRootRemHeight,
    dzSubRemHeight: () => dzSubRemHeight,
    listWidth: () => listWidth,
    rootFontSize: () => rootFontSize,
    subFontSize: () => subFontSize,
    scale: () => scale
  })

  function renderDropzone (idx) {
    return {
      parentID,
      idxInThisLevel: idx,
      ancestorRoomIDs: [''],
      roomsInThisLevel: trees,
      colorForDebugging: 'purple',
    }
  }
</script>

<div onclick={e => {
    if (e.target === e.currentTarget) {
      activateInput({ 
        anchorID, 
        modifiers: { 
          persistsOnList: true,
          parentID
        }
      })
    }
  }}
  style={cssStyle}
>
  {#if trees}
    {#each trees as taskObj, i (taskObj.id)}
      <AnimationDiv {listWidth} inDialog={parentID}>
        <div class="z-0">
          <Dropzone {...renderDropzone(i)} />
        </div>

        <div style="padding: {padding}px" class:list-container={!parentID}>
          <RecursiveTask {taskObj}
            depth={1}
            ancestorRoomIDs={['']}
          />
        </div>

        <div style="width: {listWidth}" class="absolute z-0"> <!-- absolute takes it out of flow, so it'd collapse with consecutive dropzones -->
          <Dropzone {...renderDropzone(i+1)} />
        </div>
      </AnimationDiv>
    {/each}

    <div style="width: {listWidth}" class="z-0">
      <Dropzone {...renderDropzone(trees.length)} />
    </div>
  {/if}
  
  <div id={anchorID} style="anchor-name: {anchorID}; height: 24px; width: {listWidth}; pointer-events: none;" >

  </div>
</div>

<style>
  .list-container {
    background-color: var(--navbar-bg-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
</style>