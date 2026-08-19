<script>
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import { HEIGHTS } from '$lib/utils/constants.js'
  import { randomID } from '$lib/utils/core.js'
  import { notesFS } from '$lib/styles/reused.module.css'
  import { getContext, setContext } from 'svelte'

  let {
    style,
    listWidth,
    trees = null,
    parentID = '',
    compact = false,
    clipRectFunction = undefined,
    viewTransitionClass = undefined
  } = $props()

  const { activateInput } = getContext('popover-input')
  const anchorID = `--dropzone-root-last-${randomID()}`

  const dzRootHeight = $derived(
    compact ? '0.25rem' : `${parentID ? HEIGHTS.SUB_DROPZONE : HEIGHTS.ROOT_DROPZONE}rem`
  )
  const dzSubHeight = $derived(compact ? '0.25rem' : `${HEIGHTS.SUB_DROPZONE}rem`)
  const indent = $derived(compact ? '0.75rem' : '2rem')
  const rootFontSize = $derived(compact ? notesFS : '1rem')
  const subFontSize = $derived(compact ? notesFS : '0.875rem')
  const startDepth = $derived(compact ? 2 : 1)

  const width = $derived(listWidth ?? (compact ? 'fit-content' : undefined))

  setContext('list-config', { 
    debug: () => false,
    indent: () => indent, 
    dzRootHeight: () => dzRootHeight,
    dzSubHeight: () => dzSubHeight,
    rootFontSize: () => rootFontSize,
    subFontSize: () => subFontSize,
    clipRectFunction: () => clipRectFunction
  })

  function dzProps (idx, debugColor = 'purple') {
    return {
      parentID,
      idxInThisLevel: idx,
      roomsInThisLevel: trees,
      debugColor
    }
  }

  function onclick (e) {
    if (e.target === e.currentTarget) {
      activateInput({ 
        anchorID, 
        fontSize: parentID === '' ? rootFontSize : subFontSize,
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
      <div class="pointer-events-auto" style:width={width}>
        <Dropzone {...dzProps(i)} />
        
        <div
          style:view-transition-name={viewTransitionClass ? 'match-element' : 'none'}
          style:view-transition-class={viewTransitionClass}
        >  
          <RecursiveTask 
            {task} 
            depth={startDepth}
          />
        </div>
      </div>
    {/each}

    <div 
      class="pointer-events-auto"
      style:anchor-name={anchorID} 
      style:width="min(100%, {width})"
    >
      <Dropzone {...dzProps(trees.length)} />
    </div>
  {/if}
</div>
