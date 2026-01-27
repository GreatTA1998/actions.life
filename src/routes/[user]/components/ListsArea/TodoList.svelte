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

  const scale = $derived(isLargeFont ? 2 : 1)
  const dzRootHeight = $derived(`${(parentID ? HEIGHTS.SUB_DROPZONE : HEIGHTS.ROOT_DROPZONE) * scale}rem`)
  const dzSubHeight = $derived(`${HEIGHTS.SUB_DROPZONE * scale}rem`)
  const rootFontSize = $derived(1 * scale) // rem =  16px / 32px
  const subFontSize = $derived(0.875 * scale) // rem = 14px / 28px

  setContext('list-config', { 
    listWidth: () => listWidth,
    indent: WIDTHS.INDENT_PER_LEVEL, 
    scale: () => scale,
    dzRootHeight: () => dzRootHeight,
    dzSubHeight: () => dzSubHeight,
    rootFontSize: () => rootFontSize,
    subFontSize: () => subFontSize,
  })

  function dzProps (idx, colorForDebugging = 'purple') {
    return {
      parentID,
      idxInThisLevel: idx,
      ancestorIDs: [''],
      roomsInThisLevel: trees,
      colorForDebugging
    }
  }

  function onclick (e) {
    if (e.target === e.currentTarget) {
      activateInput({ 
        anchorID, 
        modifiers: { 
          persistsOnList: true,
          parentID
        }
      })
    }
  }
</script>

<div {onclick} style={cssStyle}>
  {#if trees}
    <Dropzone {...dzProps(0)} />

    {#each trees as task, i (task.id)}
      <AnimationDiv {listWidth} inDialog={parentID}>
        <RecursiveTask {task} depth={1} ancestorIDs={['']} />

        <Dropzone {...dzProps(i+1)} />
      </AnimationDiv>
    {/each}
  {/if}
  
  <div style="anchor-name: {anchorID}; height: {dzRootHeight}; pointer-events: none;" >

  </div>
</div>