<script>
  import LayoutCoordinator from './LayoutCoordinator.svelte'
  import RepeatTask from './RepeatTask.svelte'
  import RecursiveBulletPoint from './RecursiveBulletPoint.svelte'
  import StartTimeDurationNotify from './StartTimeDurationNotify.svelte'
  import UXFormTextArea from '$lib/components/UXFormTextArea.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import BasePopup from '$lib/components/BasePopup.svelte'
  import { 
    tasksCache,
    clickedTaskID, closeTaskPopup, ancestralTree
  } from '$lib/store'
  import { createDebouncedFunction } from '$lib/utils/core.js'
  import Task from '$lib/db/models/Task.js'
  
  const debouncedUpdate = createDebouncedFunction(
    (id, keyValueChanges) => Task.update({ id, keyValueChanges }), 
    1000
  )

  $: taskObject = $tasksCache[$clickedTaskID]
  $: console.log("taskObject =", taskObject)

  function handleDelete () {
    Task.delete({ ...taskObject })
    closeTaskPopup()
  }
</script>

{#if taskObject}
  <BasePopup on:click-outside={closeTaskPopup} zIndex={4} padding={0}>
    <LayoutCoordinator {taskObject}>
      <div style="display: flex; align-items: center; column-gap: 12px;">
        {#if !taskObject.imageDownloadURL}
          <Checkbox value={taskObject.isDone}
            on:change={e => Task.update({ id: taskObject.id, keyValueChanges: { isDone: e.target.checked }})}
            zoom={1.2}
          />
        {/if}
        <input value={taskObject.name}
          on:input={e => debouncedUpdate($clickedTaskID, { name: e.target.value })}
          placeholder="Untitled"
          type="text" 
          style="width: 100%; box-sizing: border-box; font-size: 24px;"
        >
      </div>

      <StartTimeDurationNotify {taskObject} />

      <div class="notes-tree-container">
        <div style="flex: 1 1 400px;">
          <UXFormTextArea value={taskObject.notes}
            on:input={e => debouncedUpdate($clickedTaskID, { notes: e.detail })}
            fieldLabel=""
            placeholder="Notes..."
          />
        </div>

        {#if $ancestralTree}
          <div class="ancestral-tree">
            {#if $ancestralTree.children.length > 0}
              <div class="children-layout-options">
                <button on:click={() => Task.update({ id: taskObject.id, keyValueChanges: { childrenLayout: 'timeline' } })}
                  class:active={taskObject.childrenLayout === 'timeline'}
                >
                  Timeline
                </button>
        
                <button on:click={() => Task.update({ id: taskObject.id, keyValueChanges: { childrenLayout: 'normal' } })}
                  class:active={taskObject.childrenLayout === 'normal'}
                >
                  Normal
                </button>
              </div>  
            {/if}
            
            <RecursiveBulletPoint
              originalPopupTask={taskObject}
              node={$ancestralTree}
            />
          </div>
        {/if} 
      </div>

      <div style="margin-top: 16px;"></div>

      <div style="margin-top: auto; margin-bottom: 0; display: flex; align-items: center; width: 100%; column-gap: 12px;">
        <RepeatTask {taskObject}/>

        <div style="margin-left: auto; display: flex; align-items: center; gap: 4px;">
          {#if !taskObject.isArchived}
            <button 
              on:click={async () => {
                await Task.archiveTree({ id: taskObject.id })
                closeTaskPopup()
              }} 
              class="material-symbols-outlined action-button"
              style="font-size: 22px;"
            >
              inventory_2
              <span class="tooltip">Archive this task and all its children</span>
            </button>
          {:else}
            <button on:click={async () => Task.unarchiveTree({ id: taskObject.id })} class="action-button" style="background-color: black; color: white;">
              <span class="material-symbols-outlined" style="font-size: 22px;">
                inventory_2
              </span>
            </button>
          {/if}

          <button on:click|stopPropagation={handleDelete} class="delete-button material-symbols-outlined action-button">
            delete
            <span class="tooltip">Delete this task and all its children</span>
          </button>
        </div>
      </div>
    </LayoutCoordinator>
  </BasePopup>
{/if}

<style>
  .children-layout-options {
    display: flex; 
    align-items: center; 
    width: fit-content; 
  }

  .children-layout-options button {
    padding: 2px 8px;
    border-bottom: 2px solid lightgrey;
    color: lightgrey;
  }

  .children-layout-options button.active {
    border-bottom: 2px solid black;
    color: black;
  }

  .delete-button {
    border-radius: 24px; 
  }

  ::-webkit-scrollbar {
    width: 0px;
    height: 0px;
    background: transparent;
  }

  .notes-tree-container {
    width: 100%; 
    display: flex; 
    justify-content: space-between;
    flex-wrap: wrap; 
    gap: 12px;
  }

  .ancestral-tree {
    flex: 1 1 160px;
    display: grid; 
    row-gap: 12px;
  }

  /* Refer to: https://stackoverflow.com/a/3131082/7812829 */
  input[type=text] {
    background: transparent;
    border: none;
    border-bottom: 1px solid black;
    outline: none;
    font-size: 23px;
    font-weight: 700;
    padding-left: 0px;
    padding-bottom: 6px;
  }

  .material-symbols-outlined {
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 48
  }

  .tooltip {
    visibility: hidden;
    background-color: #555;
    color: white;
    text-align: center;
    padding: 5px;
    border-radius: 6px;
    position: absolute;
    z-index: 5;
    bottom: 125%;
    right: 0;
    transform: translateY(-5px);
    white-space: nowrap;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
  }

  .delete-button:hover .tooltip {
    visibility: visible;
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 50%;
    transition: background-color 0.2s;
  }
</style>