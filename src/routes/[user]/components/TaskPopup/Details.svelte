<script>
  import RepeatTask from './RepeatTask.svelte'
  import TodoList from '/src/routes/[user]/components/ListsArea/TodoList.svelte'
  import DragDropContext from '$lib/components/DragDropContext.svelte'
  import InfoFields from './InfoFields.svelte'
  import PhotoUploadWithQuestion from './PhotoUploadWithQuestion.svelte'
  import TextArea from '$lib/components/TextArea.svelte'
  import TemplateEditor from './TemplateEditor.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import PopupTitle from '$lib/components/PopupTitle.svelte'
  import MslDeleteOutline from 'virtual:icons/material-symbols-light/delete-outline'
  import { createDebouncedFunction } from '$lib/utils/core.js'
  import { getContext } from 'svelte'
  import TemplateContext from '/src/routes/[user]/components/Templates/components/TemplatePopup/TemplateContext.svelte'

  const { Task, tasksCache, clickedTaskID, closeTaskPopup, familyTree } = getContext('app')

  let task = $derived($tasksCache[$clickedTaskID])
  let parentObj = $derived(task.parentID ? $tasksCache[task.parentID] : null)
  let editingRoutine = $state(false)

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

    <PopupTitle value={task.name}
      {parentObj}
      onInput={value => debouncedUpdate($clickedTaskID, { name: value })}
    />
  </div>

  <InfoFields {task} />

  <div class="w-full">
    <!-- TO-FIX: disallow horizontal and vertical overflow! 
      note: 100% width doesn't work because textarea is an inline element 
    -->
    <TextArea value={task.notes}
      oninput={e => debouncedUpdate($clickedTaskID, { notes: e.target.value })}
      placeholder="Notes"
    />

    {#if $familyTree}
      <DragDropContext>
        <TodoList trees={$familyTree.children}
          listWidth="100%"
          parentID={task.id}
          style="padding-bottom: 1rem"
        />
      </DragDropContext>
    {/if}
  </div>

  <div class="mt-auto w-full flex items-center gap-x-3">
    <PhotoUploadWithQuestion {task} />

    <TemplateContext>
      <RepeatTask {task} 
        onToggleTemplateEditor={() => editingRoutine = !editingRoutine} 
        isTemplateEditorOpen={editingRoutine}
      />
    </TemplateContext>

    <div class="ml-auto flex items-center gap-1">
      <button onclick={e => { e.stopPropagation(); handleDelete() }} class="flex items-center justify-center rounded-full">
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