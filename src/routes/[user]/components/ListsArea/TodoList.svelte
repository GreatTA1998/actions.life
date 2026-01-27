<script>
  import AnimationDiv from './AnimationDiv.svelte'
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import { HEIGHTS, WIDTHS } from '$lib/utils/constants.js'
  import { getRandomID } from '$lib/utils/core.js'
  import { getContext, setContext } from 'svelte'

  let {
    cssStyle,
    listWidth,
    isLargeFont = false,
    trees = null,
    parentID = ''
  } = $props()

  const { activateInput } = getContext('popover-input')

  const anchorID = `--dropzone-root-last-${getRandomID()}`

  // scaled units
  const scale = $derived(isLargeFont ? 2 : 1)
  const dzRootRemHeight = $derived((parentID ? HEIGHTS.SUB_DROPZONE : HEIGHTS.ROOT_DROPZONE) * scale)
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

  function renderDropzone (idx, colorForDebugging = 'purple') {
    return {
      parentID,
      idxInThisLevel: idx,
      ancestorIDs: [''],
      roomsInThisLevel: trees,
      colorForDebugging
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
    <Dropzone {...renderDropzone(0)} />

    {#each trees as task, i (task.id)}
      <AnimationDiv {listWidth} inDialog={parentID}>
        <RecursiveTask 
          {task}
          depth={1}
          ancestorIDs={['']}
        />

        <Dropzone style="width: {listWidth}" {...renderDropzone(i+1)} />
      </AnimationDiv>
    {/each}
  {/if}
  
  <div id={anchorID} style="anchor-name: {anchorID}; height: 24px; width: {listWidth}; pointer-events: none;" >

  </div>
</div>