<script>
  import { trees, listenToTasks } from './service.js'
  import MyInput from '$lib/components/MyInput.svelte'
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import { HEIGHTS } from '$lib/utils/constants.js'
  import { getRandomID } from '$lib/utils/core.js'
  import { getContext, setContext, onMount } from 'svelte'
  import { isInputActive, canCreate } from '$lib/store'
  import { writable } from 'svelte/store'

  let clicked = $state(false)
  let taskName = $state('')

  const { user, Task } = getContext('app')

  let {
    isLargeFont = false,
    cssStyle,
    listWidth = '320px',
    children
  } = $props()

  setContext('list', {
    isLargeFont: writable(isLargeFont)
  })

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
      remHeight: HEIGHTS.ROOT_DROPZONE * (isLargeFont ? 1.5 : 1) // 1.5rem = 24px. Technically should be 2rem, but it's too sparse
    }
  }

  function createTask () {
    if (taskName !== '') {
      Task.create({ id: getRandomID(), newTaskObj: {
        name: taskName,
        orderValue: $user.maxOrderValue + 1, // k = 1
      }})
      taskName = ''
    }
    else clicked = false
  }
</script>

<!-- NOTE: background-color: var(--todo-list-bg-color); is not yet unified, so it IS confusing -->
<div style={cssStyle} 
  onpointerdown={(e) => { 
    if (e.target !== e.currentTarget) return;
    if ($isInputActive) canCreate.set(false); 
  }}
  onclick={e => {
      if (e.target !== e.currentTarget) return;
      if ($canCreate) {
        clicked = true
        isInputActive.set(true)
      }
      else canCreate.set(true)
    }
  }
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

  {#if clicked}
    <div style="height: {HEIGHTS.ROOT_DROPZONE}rem;">
      <MyInput value={taskName}
        oninput={e => taskName = e.target.value}
        onfocusout={() => {
          isInputActive.set(false);
          clicked = false
        }}
        onEnterPress={createTask}
        fontSize="{HEIGHTS.ROOT_DROPZONE * 9/10}rem"
        width="100%"
      />
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