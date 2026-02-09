<script>
  import RepeatTask from './RepeatTask.svelte'
  import TodoList from '/src/routes/[user]/components/ListsArea/TodoList.svelte'
  import DragDropContext from '$lib/components/DragDropContext.svelte'
  import ParentBadge from '$lib/components/ParentBadge.svelte'
  import InfoFields from './InfoFields.svelte'
  import PhotoUploadWithQuestion from './PhotoUploadWithQuestion.svelte'
  import TextArea from '$lib/components/TextArea.svelte'
  import TemplateEditor from './TemplateEditor.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import MslDeleteOutline from 'virtual:icons/material-symbols-light/delete-outline'
  import { createDebouncedFunction } from '$lib/utils/core.js'
  import { placeholderFieldLarge } from '$lib/styles/reused.module.css'
  import { getContext } from 'svelte'

  const { Task, tasksCache, clickedTaskID, closeTaskPopup, ancestralTree } = getContext('app')

  let task = $derived($tasksCache[$clickedTaskID])
  let editingRoutine = $state(false)
  let parent = $derived(task.parentID ? $tasksCache[task.parentID] : null)
  let inputRef = $state(null)

  const debouncedUpdate = createDebouncedFunction(
    (id, kvChanges) => Task.update({ id, kvChanges }), 
    1000
  )

  async function handleDelete () {
    if (task.imageDownloadURL && !confirm("Are you sure you want to delete this task and its image?")) {
      return
    }
    if (task.notes && !confirm("Are you sure you want to delete this task and its notes?")) {
      return
    }
    await Task.delete({ 
      id: task.id
    })
    closeTaskPopup()
  }
</script>

<div class="h-full flex flex-col gap-y-2">
  <div class="flex items-center gap-x-2">
    <div class="shrink">
      {#if task.iconURL}
        <DoodleIcon iconTask={task} size={48} />
      {:else}
        <Checkbox fontSize="1.5rem"
          value={task.isDone}
          onchange={e => Task.update({ id: task.id, kvChanges: { isDone: e.target.checked }})}
        />
      {/if}
    </div>

    <div onclick={() => inputRef.focus()} 
      class="flex flex-1 items-center gap-x-2 pb-0.5"
      style="cursor: text; border-bottom: 1px solid var(--faint-color);"
    >
      <input bind:this={inputRef} 
        value={task.name}
        oninput={e => debouncedUpdate($clickedTaskID, { name: e.target.value })}
        placeholder="Title"
        type="text" 
        class="truncate {placeholderFieldLarge}"
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

  <InfoFields {task} />

  <div style="width: 100%; max-width: 100%;">
    <!-- TO-FIX: disallow horizontal and vertical overflow! 
      note: 100% width doesn't work because textarea is an inline element 
    -->
    <TextArea value={task.notes}
      oninput={e => debouncedUpdate($clickedTaskID, { notes: e.target.value })}
      placeholder="Notes"
    />

    <DragDropContext>
      <TodoList trees={$ancestralTree.children}
        listWidth="100%"
        parentID={task.id}
        style="padding-bottom: 1rem"
      />
    </DragDropContext>
  </div>

  <div style="margin-top: auto; margin-bottom: 0; display: flex; align-items: center; width: 100%; column-gap: 12px;">
    <PhotoUploadWithQuestion {task} />

    <RepeatTask {task} onToggleTemplateEditor={() => editingRoutine = !editingRoutine} isTemplateEditorOpen={editingRoutine}/>

    <div style="margin-left: auto; display: flex; align-items: center; gap: 4px;">
      <button onclick={e => { e.stopPropagation(); handleDelete() }} class="delete-button action-button">
        <MslDeleteOutline style="font-size: var(--popup-control);"/>
      </button>
    </div>
  </div>

  {#if task.templateID && editingRoutine}
    <div class="template-editor-section">
      <h3 class="template-title">Routine Template</h3>
      <TemplateEditor templateID={task.templateID} />
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