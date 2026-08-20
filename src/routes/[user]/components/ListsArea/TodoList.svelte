<script>
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import { HEIGHTS } from '$lib/utils/constants.js'
  import { randomID } from '$lib/utils/core.js'
  import { notesFS } from '$lib/styles/reused.module.css'
  import { getContext, setContext } from 'svelte'

  let {
    style = '',
    listWidth = '100%',
    trees = null,
    parentID = '',
    clipRectFunction = () => ({ left: -Infinity, top: -Infinity, right: Infinity, bottom: Infinity }),
    viewTransitionClass = '',
    compact = false,
    debug = false
  } = $props()

  const { activateInput } = getContext('popover-input')
  const anchorID = `--dropzone-root-last-${randomID()}`

  const dzRootHeight = $derived(
    compact ? '4px' : `${parentID ? HEIGHTS.SUB_DROPZONE : HEIGHTS.ROOT_DROPZONE}rem`
  )
  const dzSubHeight = $derived(compact ? '4px' : `${HEIGHTS.SUB_DROPZONE}rem`)
  const indent = $derived(compact ? '0.75rem' : '2rem')
  const rootFontSize = $derived(compact ? notesFS : '1rem')
  const subFontSize = $derived(compact ? notesFS : '0.875rem')
  const startDepth = $derived(compact ? 2 : 1)

  setContext('list-config', { 
    debug: () => debug,
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
      <div class="pointer-events-auto" style:width={listWidth}>
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
      style:width="min(100%, {listWidth})"
    >
      <Dropzone {...dzProps(trees.length)} />
    </div>
  {/if}
</div>
