<script>
  import { trees, listenToTasks } from './service.js'
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import { HEIGHTS } from '$lib/utils/constants.js'
  import { getContext, onMount } from 'svelte'

  const { user } = getContext('app')

  let {
    willShowCheckbox = true,
    isLargeFont = false,
    cssStyle,
    listWidth = '320px',
    children
  } = $props()

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
      heightInPx: HEIGHTS.ROOT_DROPZONE
    }
  }
</script>

<!-- NOTE: background-color: var(--todo-list-bg-color); is not yet unified, so it IS confusing -->
<div style={cssStyle}>
  {#if $trees}
    {#each $trees as taskObj, i (taskObj.id)}
      <div style="width: {listWidth}">
        <div style="width: 235px;">
          <Dropzone {...renderDropzone(i)} />
        </div>

        <div class="list-container">
          <RecursiveTask {taskObj}
            depth={0}
            ancestorRoomIDs={['']}
            {willShowCheckbox}
            {isLargeFont}
          />
        </div>

        <!-- absolute takes it out of flow, so it'd collapse with consecutive dropzones -->
        <div style="position: absolute; width: 235px;">
          <Dropzone {...renderDropzone(i+1)} />
        </div>
      </div>
    {/each}

    <div style="width: 235px;">
      <Dropzone {...renderDropzone($trees.length)} />
    </div>
  {/if}
  
  {@render children?.()}
</div>

<style>  
  .list-container {
    padding: 0.5vw;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
</style>