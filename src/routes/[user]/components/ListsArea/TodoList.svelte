<script>
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import { HEIGHTS } from '$lib/utils/constants.js'
  import { randomID } from '$lib/utils/core.js'
  import { getContext, setContext } from 'svelte'

  let {
    style,
    listWidth,
    trees = null,
    parentID = '',
    indent = '2rem',
    rootFontSize = '1rem',
    subFontSize = '0.875rem',
    startDepth = 1,
    rootDropzoneHeight = undefined,
    subDropzoneHeight = undefined,
    clipRectFunction = undefined,
    unscheduleOnDrop = false,
    from = 'list'
  } = $props()

  const { activateInput } = getContext('popover-input')
  const { logicAreaRect } = getContext('drag-drop')
  const anchorID = `--dropzone-root-last-${randomID()}`

  const dzRootHeight = $derived(
    rootDropzoneHeight ?? `${parentID ? HEIGHTS.SUB_DROPZONE : HEIGHTS.ROOT_DROPZONE}rem`
  )
  const dzSubHeight = $derived(subDropzoneHeight ?? `${HEIGHTS.SUB_DROPZONE}rem`)
  const ancestorIDs = $derived(parentID ? [parentID] : [''])

  setContext('list-config', { 
    debug: () => false,
    indent: () => indent, 
    dzRootHeight: () => dzRootHeight,
    dzSubHeight: () => dzSubHeight,
    rootFontSize: () => rootFontSize,
    subFontSize: () => subFontSize,
    clipRectFunction: () => clipRectFunction ?? $logicAreaRect,
    unscheduleOnDrop: () => unscheduleOnDrop,
    from: () => from
  })

  function dzProps (idx, debugColor = 'purple') {
    return {
      parentID,
      idxInThisLevel: idx,
      ancestorIDs,
      roomsInThisLevel: trees,
      debugColor
    }
  }

  function onclick (e) {
    if (e.target === e.currentTarget) {
      activateInput({ 
        anchorID, 
        modifiers: { 
          onList: true,
          parentID
        }
      })
    }
  }
</script>

<div {onclick} {style} class="relative">
  {#if trees}
    {#each trees as task, i (task.id)}
      <div style:width={listWidth}>
        <Dropzone {...dzProps(i)} />
        
        <div
          style:view-transition-name="match-element"
          style:view-transition-class={parentID ? 'dialog-list-item' : 'list-item'}
        >  
          <RecursiveTask 
            {task} 
            depth={startDepth} 
            {ancestorIDs}
          />
        </div>
      </div>
    {/each}

    <div 
      style:anchor-name={anchorID} 
      style:width="min(100%, {listWidth})"
    >
      <Dropzone {...dzProps(trees.length)} />
    </div>
  {/if}
</div>