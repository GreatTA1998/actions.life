<script>
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import { HEIGHTS, WIDTHS } from '$lib/utils/constants.js'
  import { getRandomID } from '$lib/utils/core.js'
  import { getContext, setContext } from 'svelte'

  let {
    style,
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
  const rootFontSize = $derived(`${1 * scale}rem`) // rem =  16px / 32px
  const subFontSize = $derived(`${0.875 * scale}rem`) // rem = 14px / 28px

  setContext('list-config', { 
    debug: () => false,
    indent: () => `${WIDTHS.INDENT_PER_LEVEL}px`, 
    minWidth: () => '240px', // too large = wasteful gap between columns 
    dzRootHeight: () => dzRootHeight,
    dzSubHeight: () => dzSubHeight,
    rootFontSize: () => rootFontSize,
    subFontSize: () => subFontSize,
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
          persistsOnList: true,
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
          <RecursiveTask {task} depth={1} ancestorIDs={['']} />
        </div>
      </div>
    {/each}

    <div style:anchor-name={anchorID}> <!-- trick to anchor onto the dropzone from a list click -->
      <Dropzone {...dzProps(trees.length)} />
    </div>
  {/if}
</div>
