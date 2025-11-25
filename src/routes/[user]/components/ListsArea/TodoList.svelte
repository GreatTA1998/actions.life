<script>
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import { HEIGHTS, WIDTHS } from '$lib/utils/constants.js'
  import { activateInput } from '$lib/store/popoverInput.js'
  import { setContext } from 'svelte'

  let {
    cssStyle,
    listWidth,
    isLargeFont = false,
    trees = null
  } = $props()

  const anchorID = '--dropzone-root-last'
  
  const padding = 6
  const indent = WIDTHS.INDENT_PER_LEVEL

  // scaled units
  const scale = isLargeFont ? 2 : 1
  const dzRootRemHeight = HEIGHTS.ROOT_DROPZONE * scale
  const dzSubRemHeight = HEIGHTS.SUB_DROPZONE * scale
  const rootFontSize = 1 * scale // rem =  16px / 32px
  const subFontSize = 0.875 * scale // rem = 14px / 28px

  setContext('list-config', { 
    indent, 
    dzRootRemHeight, 
    dzSubRemHeight,
    fullWidth: listWidth - padding,
    rootFontSize,
    subFontSize,
    scale
  })

  function renderDropzone (idx) {
    return {
      idxInThisLevel: idx,
      ancestorRoomIDs: [''],
      roomsInThisLevel: trees,
      parentID: '',
      colorForDebugging: 'purple',
    }
  }
</script>

<div onclick={e => {
    if (e.target === e.currentTarget) {
      activateInput({ 
        anchorID, 
        modifiers: { persistsOnList: true }
      })
    }
  }}
  style={cssStyle} 
>
  {#if trees}
    {#each trees as taskObj, i (taskObj.id)}
      <div style="width: {listWidth}px;">
        <div class="z-0">
          <Dropzone {...renderDropzone(i)} />
        </div>

        <div style="padding: {padding}px" class="list-container">
          <RecursiveTask {taskObj}
            depth={1}
            ancestorRoomIDs={['']}
          />
        </div>

        <div style="width: {listWidth}px" class="absolute z-0"> <!-- absolute takes it out of flow, so it'd collapse with consecutive dropzones -->
          <Dropzone {...renderDropzone(i+1)} />
        </div>
      </div>
    {/each}

    <div style="width: {listWidth}px" class="z-0">
      <Dropzone {...renderDropzone(trees.length)} />
    </div>
  {/if}
  
  <div id={anchorID} style="anchor-name: {anchorID}; height: 24px; width: {listWidth}px; pointer-events: none;" >

  </div>
</div>

<style>
  .list-container {
    background-color: var(--navbar-bg-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
</style>