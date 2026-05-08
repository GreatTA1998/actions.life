<script>
  import Checkbox from '$lib/components/Checkbox.svelte'
  import ParentBadge from '$lib/components/ParentBadge.svelte'
  import SubtaskCountIndicator from '$lib/components/SubtaskCountIndicator.svelte'
  import { titleFS } from '$lib/styles/reused.module.css'
  import { getContext } from 'svelte'
  import { user } from '$lib/store'

  const { Task, tasksCache, openTaskPopup } = getContext('app')

  let { 
    task = null, 
    color = 'var(--task-name-color)',
    icon
  } = $props()

  let parentObj = $derived(task.parentID ? $tasksCache[task.parentID] : null)
</script>

<div class="flex items-center gap-x-1 w-full">
  <div style:flex-shrink="0">
    {#if task.iconURL}
      {@render icon()}
    {:else}
      <Checkbox
        fontSize={titleFS}
        value={task.isDone}
        onchange={e => Task.update({
          id: task.id,
          kvChanges: {
            isDone: e.target.checked
          }
        })}
      />
    {/if}
  </div>

  <div 
    style:flex-grow="0"
    style:font-size={titleFS}
    style:color={color}
    class="font-medium truncate cursor-pointer select-none" 
    onclick={() => openTaskPopup(task)} 
  >
    {task.name}
  </div>

  {#if task.children.length > 0}
    <SubtaskCountIndicator {task} {color} fontSize={titleFS} extraClass="min-w-fit"/>
  {/if}

  {#if parentObj}
    <ParentBadge {parentObj} --color={color} />
  {/if}

  {#if task.tagIDs}
    {#each task.tagIDs as tagID (tagID)}
      <div class="shrink-0 w-[5px] h-[5px] rounded-[50%]" 
        style:background-color={$user.tags?.[tagID]?.color}
      >
      </div>
    {/each}
  {/if}
</div>