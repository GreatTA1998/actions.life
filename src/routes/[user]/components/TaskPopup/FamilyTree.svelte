<script>
  import RecursiveTask from '/src/routes/[user]/components/TaskTree/RecursiveTask.svelte'
  import { getContext, setContext } from 'svelte'
  import { HEIGHTS, WIDTHS } from '$lib/utils/constants.js'
  
  const { ancestralTree } = getContext('app')

  let isLargeFont = false

  const padding = 6
  const indent = WIDTHS.INDENT_PER_LEVEL

  const scale = isLargeFont ? 2 : 1
  const dzRootRemHeight = HEIGHTS.ROOT_DROPZONE * scale
  const dzSubRemHeight = HEIGHTS.SUB_DROPZONE * scale
  const rootFontSize = 1 * scale // rem =  16px / 32px
  const subFontSize = 0.875 * scale // rem = 14px / 28px
  const listWidth = 300

  setContext('list-config', { 
    indent, 
    dzRootRemHeight, 
    dzSubRemHeight,
    fullWidth: listWidth - padding,
    rootFontSize,
    subFontSize,
    scale
  })
  // setContext()

</script>

{#if $ancestralTree}
  {#each $ancestralTree.children as child}
    <!-- ancestorRoomIDs is wrong -->
    <RecursiveTask 
      taskObj={child}
      depth={1}
      ancestorRoomIDs={[$ancestralTree.id]}
    />
  {/each}
{/if} 