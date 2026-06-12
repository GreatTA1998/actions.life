<script>
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import { HEIGHTS, WIDTHS } from '$lib/utils/constants.js'
  import { randomID } from '$lib/utils/core.js'
  import { getContext, setContext } from 'svelte'

  let {
    style,
    listWidth,
    isLargeFont = false,
    trees = null,
    parentID = ''
  } = $props()

  const { activateInput } = getContext('popover-input')
  const anchorID = `--dropzone-root-last-${randomID()}`
  
  const scale = $derived(isLargeFont ? 1.5 : 1)
  const dzRootHeight = $derived(`${(parentID ? HEIGHTS.SUB_DROPZONE : HEIGHTS.ROOT_DROPZONE) * scale}rem`)
  const dzSubHeight = $derived(`${HEIGHTS.SUB_DROPZONE * scale}rem`)
  const rootFontSize = $derived(`${1 * scale}rem`) // rem =  16px / 32px
  const subFontSize = $derived(`${0.875 * scale}rem`) // rem = 14px / 28px
  const indent = $derived(`${WIDTHS.INDENT_PER_LEVEL * scale}px`)

  setContext('list-config', { 
    debug: () => false,
    indent: () => indent, 
    dzRootHeight: () => dzRootHeight,
    dzSubHeight: () => dzSubHeight,
    rootFontSize: () => rootFontSize,
    subFontSize: () => subFontSize
  })

  function dzProps (idx, debugColor = 'purple') {
    return {
      parentID,
      idxInThisLevel: idx,
      ancestorIDs: [''],
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
          <RecursiveTask {task} 
            depth={1} 
            ancestorIDs={['']} 
          />
        </div>
      </div>
    {/each}

    <div style:anchor-name={anchorID}>
      <Dropzone {...dzProps(trees.length)} extraClass="w-[240px]" />
    </div>
  {/if}
</div>
