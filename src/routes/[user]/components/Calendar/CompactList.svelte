<script>
  import Checkbox from '$lib/components/Checkbox.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import SubtaskCountIndicator from '$lib/components/SubtaskCountIndicator.svelte'
  import { user } from '$lib/store'
  import { randomID } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')
  const { openTaskPopup } = getContext('task-popup')
  const {
    startMouseDrag, startTouchDrag, registerDropzone,
    bestDropzoneID, dropPreviewCSS, placeInTaskElement
  } = getContext('drag-drop')

  let {
    tasks = [],
    onReorder,
    clipRectFunction = () => ({ left: -Infinity, top: -Infinity, right: Infinity, bottom: Infinity }),
    dragOrigin,
    fontSize,
    rowClass = '',
    nameClass = '',
    showChildren = false,
    accessories,
    details
  } = $props()

  const listID = randomID()
</script>

{#snippet zone(zoneID, onDrop, place, line)}
  <div
    {@attach registerDropzone({ id: zoneID, clipRectFunction, onDrop })}
    class={['pointer-events-none absolute z-10', place]}
    style:left="var(--left-padding)" style:right="var(--left-padding)"
  >
    {#if $bestDropzoneID === zoneID}
      <div class={['h-1', line]} style:border-radius="var(--left-padding)" style={dropPreviewCSS}></div>
    {/if}
  </div>
{/snippet}

{#snippet taskRow(task)}
  <div
    data-task-id={task.id} data-drag-origin={dragOrigin}
    style:font-size={fontSize} style:--task-control-width={fontSize}
    class={['pointer-events-auto flex flex-col select-none py-0.5', rowClass]}
    onmousedown={e => startMouseDrag({ e, id: task.id })}
    ontouchstart={e => startTouchDrag({ e, id: task.id })}
  >
    <div class="flex items-center gap-x-1">
      <div class="shrink-0">
        {#if task.iconURL}
          <DoodleIcon iconTask={task} size={fontSize} scaleToFit />
        {:else}
          <Checkbox value={task.isDone} {fontSize} onchange={e => Task.update({ id: task.id, kvChanges: { isDone: e.target.checked } })} />
        {/if}
      </div>
      <button onclick={() => openTaskPopup(task)} style:color="var(--task-name-color)" class={['shrink-1 min-w-[1ch] min-h-4 text-left leading-[1.25]', nameClass]}>
        <span class="truncate text-clip">{task.name}</span>
      </button>
      {#if task.tagIDs}
        {#each task.tagIDs as tagID (tagID)}
          <div class="shrink-0 size-[5px] rounded-full" style:background-color={$user.tags?.[tagID]?.color}></div>
        {/each}
      {/if}
      {#if task.children.length}<SubtaskCountIndicator {task} {fontSize} extraClass="min-w-fit" />{/if}
      {@render accessories?.(task)}
    </div>
    {@render details?.(task)}
  </div>
{/snippet}

{#snippet list(items, reorder, level)}
  <div class="flex w-full flex-col">
    {#each items as task, i (task.id)}
      {@const last = i === items.length - 1}
      <div class="flex w-full flex-col">
        <div class="relative w-full">
          {@render zone(`${level}:${i}`, () => reorder(i), last ? 'top-0 h-1/2' : 'top-0 bottom-0', '-translate-y-1/2')}
          {#if last}
            {@render zone(`${level}:${i + 1}`, () => reorder(i + 1), 'top-1/2 h-1/2', 'absolute inset-x-0 bottom-0 translate-y-1/2')}
          {/if}
          <div class="px-[var(--left-padding)]">{@render taskRow(task)}</div>
        </div>
        {#if showChildren && task.children.length}
          <div data-task-id={task.id} class="ml-3">
            {@render list(task.children, index => placeInTaskElement({ parentID: task.id, rooms: task.children, index }), `${level}:${task.id}`)}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/snippet}

{@render list(tasks, onReorder, listID)}
