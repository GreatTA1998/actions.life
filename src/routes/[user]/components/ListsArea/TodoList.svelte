<script>
  import { trees, listenToTasks } from './service.js'
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import { HEIGHTS } from '$lib/utils/constants.js'
  import { getRandomID } from '$lib/utils/core.js'
  import { activateInput } from '$lib/utils/popoverInput.js'
  import { getContext, onMount } from 'svelte'

  const { user, Task } = getContext('app')
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

  function createTask (taskName) {
    Task.create({ id: getRandomID(), newTaskObj: {
      name: taskName,
      orderValue: $user.maxOrderValue + 1, // k = 1
    }})
  }
</script>

<div onclick={e => {
    if (e.target === e.currentTarget) {
      activateInput(anchorID, createTask)
    }
  }}
  style={cssStyle} 
>
  {#if $trees}
    {#each $trees as taskObj, i (taskObj.id)}
      <div style="width: {listWidth};">
        <div style="width: 235px;">
          <Dropzone {...renderDropzone(i)} />
        </div>

        <div class="list-container">
          <RecursiveTask {taskObj}
            depth={0}
            ancestorRoomIDs={['']}
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
  
  <div style="anchor-name: {anchorID}; outline: 2px solid red;">

  </div>
  
  {@render children?.()}
</div>

<style>  
  .list-container {
    padding: 0.5vw;
    background-color: var(--navbar-bg-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
</style>