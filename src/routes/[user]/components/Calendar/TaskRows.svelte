<script>
  import TaskRows from './TaskRows.svelte'
  import ReorderRows from './ReorderRows.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import ListenToDoc from '$lib/components/ListenToDoc.svelte'
  import ParentBadge from '$lib/components/ParentBadge.svelte'
  import SubtaskCountIndicator from '$lib/components/SubtaskCountIndicator.svelte'
  import { user } from '$lib/store'
  import { randomID } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')
  const { openTaskPopup } = getContext('task-popup')
  const { startMouseDrag, startTouchDrag, placeInTaskElement } = getContext('drag-drop')

  let {
    tasks = [],
    onReorder,
    clipRectFunction = () => ({ left: -Infinity, top: -Infinity, right: Infinity, bottom: Infinity }),
    dragOrigin,
    fontSize,
    rowClass = '',
    nameClass = '',
    showImage = false,
    showParent = false,
    showNotes = false,
    showChildren = false
  } = $props()

  const listID = randomID()
</script>

<ReorderRows
  {tasks}
  {clipRectFunction}
  {onReorder}
  slotID={i => `${listID}:${i}`}
>
  {#snippet row (task)}
    <div
      data-task-id={task.id}
      data-drag-origin={dragOrigin}
      style:font-size={fontSize}
      style:--task-control-width={fontSize}
      class={['pointer-events-auto flex flex-col select-none py-0.5', rowClass]}
      onmousedown={e => startMouseDrag({ e, id: task.id })}
      ontouchstart={e => startTouchDrag({ e, id: task.id })}
    >
      <div class="flex items-center gap-x-1">
        <div class="shrink-0">
          {#if task.iconURL}
            <DoodleIcon iconTask={task} size={fontSize} scaleToFit />
          {:else}
            <Checkbox value={task.isDone} fontSize={fontSize}
              onchange={e => Task.update({
                id: task.id,
                kvChanges: { isDone: e.target.checked }
              })}
            />
          {/if}
        </div>

        <button onclick={() => openTaskPopup(task)}
          style:color="var(--task-name-color)"
          class={['shrink-1 min-w-[1ch] min-h-4 text-left leading-[1.25]', nameClass]}
        >
          <span class="truncate text-clip">{task.name}</span>
        </button>

        {#if showImage && task.imageDownloadURL}
          <img onclick={() => openTaskPopup(task)} src={task.imageDownloadURL} class="w-auto shrink-0 rounded-sm" style:height="1lh">
        {/if}

        {#if task.tagIDs}
          {#each task.tagIDs as tagID (tagID)}
            <div class="shrink-0 size-[5px] rounded-full" style:background-color={$user.tags?.[tagID]?.color}></div>
          {/each}
        {/if}

        {#if task.children.length}
          <SubtaskCountIndicator {task} fontSize={fontSize} extraClass="min-w-fit" />
        {/if}

        {#if showParent && task.parentID}
          <ListenToDoc docPath="/users/{$user.uid}/tasks/{task.parentID}">
            {#snippet children (parentObj)}
              <ParentBadge {parentObj} --color="var(--task-name-color)" />
            {/snippet}
          </ListenToDoc>
        {/if}
      </div>

      {#if showNotes && task.notes}
        <button onclick={() => openTaskPopup(task)}
          style:margin-left="calc(var(--task-control-width) + 0.25rem)"
          class="max-w-[45ch] text-left text-xs leading-[1.25] text-neutral-600"
        >
          <span class="line-clamp-2">{task.notes}</span>
        </button>
      {/if}
    </div>
  {/snippet}

  {#snippet after (task)}
    {#if showChildren && task.children.length}
      <div data-task-id={task.id} class="ml-3">
        <TaskRows
          tasks={task.children}
          onReorder={index => placeInTaskElement({ parentID: task.id, rooms: task.children, index })}
          {clipRectFunction}
          {dragOrigin}
          {fontSize}
          {rowClass}
          {nameClass}
          {showImage}
          {showParent}
          {showNotes}
          {showChildren}
        />
      </div>
    {/if}
  {/snippet}
</ReorderRows>
