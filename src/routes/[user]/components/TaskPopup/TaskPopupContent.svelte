<script>
  import PhotoLayout from './PhotoLayout.svelte'
  import RepeatTask from './RepeatTask.svelte'
  import PhotoUpload from './PhotoUpload.svelte'
  import RecursiveBulletPoint from './RecursiveBulletPoint.svelte'
  import StartTimeDurationNotify from './StartTimeDurationNotify.svelte'
  import PopoverSnackbar from '$lib/components/PopoverSnackbar.svelte'
  import UXFormTextArea from '$lib/components/UXFormTextArea.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import { createDebouncedFunction } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  const { Task, tasksCache, clickedTaskID, closeTaskPopup, ancestralTree } = getContext('app')
  
  let taskObject = $derived($tasksCache[$clickedTaskID])
  $effect(() => console.log('taskObject =', taskObject))

  const debouncedUpdate = createDebouncedFunction(
    (id, keyValueChanges) => Task.update({ id, keyValueChanges }), 
    1000
  )

  function handleDelete () {
    if (taskObject.imageDownloadURL && !confirm("Are you sure you want to delete this task and its image?")) {
      return
    }
    if (taskObject.notes && !confirm("Are you sure you want to delete this task and its notes?")) {
      return
    }
    Task.delete({ 
      id: taskObject.id
    })
    closeTaskPopup()
  }
</script>

<PhotoLayout {taskObject}>
  <div style="display: flex; align-items: center; column-gap: 12px;">
    {#if !taskObject.imageDownloadURL}
      <Checkbox value={taskObject.isDone}
        onchange={e => Task.update({ id: taskObject.id, keyValueChanges: { isDone: e.target.checked }})}
        zoom={1.2}
      />
    {/if}
    <input value={taskObject.name}
      oninput={e => debouncedUpdate($clickedTaskID, { name: e.target.value })}
      placeholder="Untitled"
      type="text" 
      style="width: 100%; box-sizing: border-box; font-size: 24px;"
    >
  </div>

  <StartTimeDurationNotify {taskObject} />

  <div class="notes-tree-container">
    <div style="flex: 1 1 400px;">
      <UXFormTextArea value={taskObject.notes}
        oninput={e => debouncedUpdate($clickedTaskID, { notes: e.target.value })}
        fieldLabel=""
        placeholder="Write notes here..."
      />
    </div>

    {#if $ancestralTree}
      <div class="ancestral-tree">
        <RecursiveBulletPoint
          originalPopupTask={taskObject}
          node={$ancestralTree}
        />
      </div>
    {/if} 
  </div>

  <div style="margin-top: 16px;"></div>

  <div style="margin-top: auto; margin-bottom: 0; display: flex; align-items: center; width: 100%; column-gap: 12px;">
    <PopoverSnackbar 
      {activator} 
      {customActions} 
    />

    {#snippet activator({ open, close, setLoading })}
      {#if !taskObject.imageDownloadURL}
        <PhotoUpload {taskObject} 
          onUpload={() => {
            open();
            setLoading(true);
          }} 
          onFinished={() => {
            close({ timeout: 5000 });
            setLoading(false);
          }}
        />
      {/if}
    {/snippet}

    {#snippet customActions({ open, close, setLoading })}
      <div style="color: white; display: flex; justify-content: space-between; align-items: center; gap: 16px;">
        How was it? 
        <div style="display: flex; align-items: center; column-gap: 12px;">
          {#each [': (', ': |', ': )'] as emotion}
            <button onclick={() => {
              Task.update({ id: taskObject.id, keyValueChanges: { notes: emotion + ' ' + taskObject.notes }});
              close({ timeout: 0 });
            }}
            style="width: 32px; height: 32px; outline: 1px solid white; border-radius: 50%; transform: rotate(90deg)"
            >
              {emotion}
            </button>
          {/each}
        </div>  
      </div>
    {/snippet}

    <RepeatTask {taskObject}/>

    <div style="margin-left: auto; display: flex; align-items: center; gap: 4px;">
      <button onclick={e => { e.stopPropagation(); handleDelete() }} class="delete-button material-symbols-outlined action-button">
        delete
        <span class="tooltip">Delete this task and all its children</span>
      </button>
    </div>
  </div>
</PhotoLayout>

<style>
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
    border-bottom: 1px solid var(--faint-color);
    border-radius: 0px;
    outline: none;
    font-size: 23px;
    font-weight: 700;
    padding-left: 0px;
    padding-bottom: 4px;
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
    border-radius: 50%;
  }
</style>