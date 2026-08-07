<script>
  import ColorTags from '$lib/components/ColorTags.svelte'
  import RepeatTask from './RepeatTask.svelte'
  import TodoList from '/src/routes/[user]/components/ListsArea/TodoList.svelte'
  import DragDropContext from '$lib/components/DragDropContext.svelte'
  import InfoFields from './InfoFields.svelte'
  import PhotoUploadWithQuestion from './PhotoUploadWithQuestion.svelte'
  import TextArea from '$lib/components/TextArea.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import PopupTitle from '$lib/components/PopupTitle.svelte'
  import MslDeleteOutline from 'virtual:icons/material-symbols-light/delete-outline'
  import { WIDTHS } from '$lib/utils/constants.js'
  import { createDebouncedFunction } from '$lib/utils/core.js'
  import { getContext } from 'svelte'
  import TemplateContext from '/src/routes/[user]/components/Templates/components/TemplatePopup/TemplateContext.svelte'

  let { task, style } = $props()

  const { Task } = getContext('app')
  const taskPopup = getContext('task-popup')
  const { closeTaskPopup, ancestralTree } = taskPopup

  const debouncedUpdate = createDebouncedFunction(
    (id, kvChanges) => Task.update({ id, kvChanges }), 
    1000
  )

  async function handleDelete () {
    if (task.imageDownloadURL && !confirm("Are you sure you want to delete this task and its image?")) {
      return
    }
    if (task.notes && !confirm(`Are you sure you want to delete ${task.name} and its notes?`)) {
      return
    }
    await Task.delete({ 
      id: task.id
    })
    closeTaskPopup()
  }
</script>

<div style="padding: 12px; {style}">
  <div class="h-full flex flex-col gap-y-2">
    <div class="flex items-center gap-x-2">
      <div class="shrink">
        {#if task.iconURL}
          <DoodleIcon iconTask={task} 
            size="48px"
          />
        {:else}
          <Checkbox fontSize="1.5rem"
            value={task.isDone}
            onchange={e => Task.update({ id: task.id, kvChanges: { isDone: e.target.checked }})}
          />
        {/if}
      </div>

      <PopupTitle 
        value={task.name}
        onInput={value => debouncedUpdate(task.id, { name: value })}
        parentID={task.parentID}
      />
    </div>

    <InfoFields {task} />

    <div class="w-full">
      <!-- TO-FIX: disallow horizontal and vertical overflow! 
        note: 100% width doesn't work because textarea is an inline element 
      -->
      <TextArea value={task.notes}
        oninput={e => debouncedUpdate(task.id, { notes: e.target.value })}
        placeholder="Notes"
        class="min-h-[3rem]"
      />

      <DragDropContext>
        <TodoList trees={$ancestralTree.children}
          listWidth="min(100%,{WIDTHS.LIST}px)"
          parentID={task.id}
          style="padding-bottom: 1rem"
        />
      </DragDropContext>
    </div>

    <div class="mt-auto w-full flex items-center gap-x-3">
      <PhotoUploadWithQuestion {task} />

      <TemplateContext>
        <RepeatTask {task} />
      </TemplateContext>

      <ColorTags {task} />

      <div class="ml-auto flex items-center gap-1">
        <button onclick={e => { e.stopPropagation(); handleDelete() }} class="flex items-center justify-center rounded-full">
          <MslDeleteOutline style="font-size: var(--popup-control);"/>
        </button>
      </div>
    </div>
  </div>
</div>