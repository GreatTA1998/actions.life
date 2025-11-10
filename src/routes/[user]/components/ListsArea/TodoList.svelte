<script>
  import { trees, listenToTasks } from './service.js'
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import { HEIGHTS } from '$lib/utils/constants.js'
  import { activateInput } from '$lib/store/popoverInput.js'
  import { getContext, onMount } from 'svelte'

  const { user } = getContext('app')
  const { isLargeFont } = getContext('list')

  let {
    cssStyle,
    listWidth = '320px',
    children
  } = $props()

  const anchorID = '--dropzone-root-last'

  onMount(() => {
    listenToTasks($user.uid)
  })
  
  function renderDropzone (idx) {
    return {
      idxInThisLevel: idx,
      ancestorRoomIDs: [''],
      roomsInThisLevel: $trees,
      parentID: '',
      colorForDebugging: "purple",
      remHeight: HEIGHTS.ROOT_DROPZONE * ($isLargeFont ? 2 : 1) // 1.5rem = 24px. Technically should be 2rem, but it's too sparse
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
  {#if $trees}
    {#each $trees as taskObj, i (taskObj.id)}
      <div style="width: {listWidth};">
        <div class="my-dz">
          <Dropzone {...renderDropzone(i)} />
        </div>

        <div class="list-container">
          <RecursiveTask {taskObj}
            depth={1}
            ancestorRoomIDs={['']}
          />
        </div>

        <div style="position: absolute" class="my-dz"> <!-- absolute takes it out of flow, so it'd collapse with consecutive dropzones -->
          <Dropzone {...renderDropzone(i+1)} />
        </div>
      </div>
    {/each}

    <div class="my-dz">
      <Dropzone {...renderDropzone($trees.length)} />
    </div>
  {/if}
  
  <div style="anchor-name: {anchorID}; height: 24px; width: 235px;" id={anchorID}>

  </div>
  
  {@render children?.()}
</div>

<style>  
  .my-dz {
    width: 235px;
    z-index: 0;
  }

  .list-container {
    padding: 0.5vw;
    background-color: var(--navbar-bg-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
</style>