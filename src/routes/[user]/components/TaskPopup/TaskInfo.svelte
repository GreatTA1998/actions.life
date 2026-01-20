<script>
  import RepeatTask from './RepeatTask.svelte'
  import FamilyTree from './FamilyTree.svelte'
  import ParentBadge from '$lib/components/ParentBadge.svelte'
  import InfoFields from './InfoFields.svelte'
  import PhotoUploadWithQuestion from './PhotoUploadWithQuestion.svelte'
  import UXFormTextArea from '$lib/components/UXFormTextArea.svelte'
  import TemplateEditor from './TemplateEditor.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import MslDeleteOutline from 'virtual:icons/material-symbols-light/delete-outline'
  import { createDebouncedFunction } from '$lib/utils/core.js'
  import { fieldWithLargePlaceholder } from '$lib/styles/reused.module.css'
  import { getContext } from 'svelte'

  const { Task, tasksCache, clickedTaskID, closeTaskPopup, ancestralTree } = getContext('app')

  let taskObject = $derived($tasksCache[$clickedTaskID])
  let editingRoutine = $state(false)
  let parent = $derived(taskObject.parentID ? $tasksCache[taskObject.parentID] : null)
  let inputRef = $state(null)

  const debouncedUpdate = createDebouncedFunction(
    (id, keyValueChanges) => Task.update({ id, keyValueChanges }), 
    1000
  )

  async function handleDelete () {
    if (taskObject.imageDownloadURL && !confirm("Are you sure you want to delete this task and its image?")) {
      return
    }
    if (taskObject.notes && !confirm("Are you sure you want to delete this task and its notes?")) {
      return
    }
    await Task.delete({ 
      id: taskObject.id
    })
    closeTaskPopup()
  }
</script>

<div style="height: 100%; display: flex; flex-direction: column; row-gap: 8px;">
  <div style="display: flex; align-items: center; column-gap: 8px;">
    {#if taskObject.iconURL}
      <DoodleIcon iconTask={taskObject} size={48} />
    {:else}
      <Checkbox
        value={taskObject.isDone}
        onchange={e => Task.update({
          id: taskObject.id,
          keyValueChanges: {
            isDone: e.target.checked
          }
        })}
        zoom={1}
      />
    {/if}

    <div onclick={() => inputRef.focus()} 
      class="flex flex-1 items-center gap-x-2 pb-0.5"
      style="cursor: text; border-bottom: 1px solid var(--faint-color);"
    >
      <input bind:this={inputRef} 
        value={taskObject.name}
        oninput={e => debouncedUpdate($clickedTaskID, { name: e.target.value })}
        placeholder="Title"
        type="text" 
        class={fieldWithLargePlaceholder}
        style="field-sizing: content; font-size: 1.5rem; font-weight: 700;"
      >

      {#if parent}
        <ParentBadge {parent} 
          --color="var(--task-name-color)" 
          --font-size="1.2rem" 
          --padding="0px 8px"
          --border-radius="24px"
          --background="rgba(230, 230, 230, 0.15)"
        />
      {/if}
    </div>
  </div>

  <InfoFields {taskObject} />

  <div style="width: 100%; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
    <div style="flex: 1 1 400px;">
      <UXFormTextArea value={taskObject.notes}
        oninput={e => debouncedUpdate($clickedTaskID, { notes: e.target.value })}
        fieldLabel=""
        placeholder="Notes"
      />
    </div>

    <!-- <div class="ancestral-tree" style="height: 48px; min-width: calc(375px - 24px);">
      {#if $ancestralTree}
        <FamilyTree/>
      {/if} 
    </div> -->
  </div>

  <div style="margin-top: auto; margin-bottom: 0; display: flex; align-items: center; width: 100%; column-gap: 12px;">
    <PhotoUploadWithQuestion {taskObject} />

    <RepeatTask {taskObject} onToggleTemplateEditor={() => editingRoutine = !editingRoutine} isTemplateEditorOpen={editingRoutine}/>

    <div style="margin-left: auto; display: flex; align-items: center; gap: 4px;">
      <button onclick={e => { e.stopPropagation(); handleDelete() }} class="delete-button action-button">
        <MslDeleteOutline style="font-size: var(--popup-control);"/>
      </button>
    </div>
  </div>

  {#if taskObject.templateID && editingRoutine}
    <div class="template-editor-section">
      <h3 class="template-title">Routine Template</h3>
      <TemplateEditor templateID={taskObject.templateID} />
    </div>
  {/if}
</div>

<style>
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

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .template-editor-section {
    margin-top: 24px;
    padding: 20px;
    background: rgba(0, 89, 125, 0.03);
    border-radius: 8px;
  }

  .template-title {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
    color: rgb(0, 89, 125);
  }
</style>