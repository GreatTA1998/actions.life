<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import Task from '$lib/db/models/Task';
  import User from '$lib/db/models/User'
  import MslMoreVert from 'virtual:icons/material-symbols-light/more-vert'
  import { deleteColorTag } from '$lib/db/helpers.js'
  import { user } from '$lib/store'
  import { randomID, getRandomColor } from '$lib/utils/core.js'
  import { paddingVal } from '$lib/styles/reused.module.css'

  let { task } = $props()

  let value = $state('')
  const presetColors = [
    '#E07A5F', // coral
    '#3D8B8B', // teal
    '#D4A03D', // amber
    '#C27BA0', // rose
    '#6B7F99', // slate
    '#C67B5C', // terracotta
    '#5E8B6A', // forest
    '#8E6B8E', // plum
  ]

  function onkeyup (e) {
    if (e.key === 'Enter') {
      if (value === '') return

      const copy = { ...$user.tags }
      const id = randomID()
      copy[id] = {
        color: getRandomColor(),
        name: e.target.value
      }

      User.update({ tags: copy })
      Task.update({
        id: task.id,
        kvChanges: {
          tagIDs: [...(task.tagIDs || []), id] 
        }
      })
      value = ''
    }
  }

  function toggleTag (id) {
    const kvChanges = {}
    const { tagIDs } = task
    if (tagIDs?.includes(id)) {
      kvChanges.tagIDs = tagIDs?.filter(elem => elem !== id) || [id]
    } else {
      kvChanges.tagIDs = [...(tagIDs || []), id] 
    }
    Task.update({ 
      id: task.id,
      kvChanges
    })
  }

  function editTag (id, kvChanges) {
    const copy = { ...$user.tags }
    for (const [k, v] of Object.entries(kvChanges)) {
      copy[id][k] = v
    }
    User.update({
      tags: copy
    })
  }
</script>

<PopoverMenu>
  {#snippet activator ({ id, anchorName })}
    <button popovertarget={id}
      class="flex items-center gap-x-2 min-w-[16px] min-h-[16px] rounded" 
      style:anchor-name={anchorName}
      style:padding="0px {paddingVal}"
    >
      {#if (task.tagIDs?.length > 0)}
        {#each task.tagIDs as id}
          <div style:background-color={$user.tags[id]?.color} class="flex gap-x-1 items-center py-1 px-2 rounded-xl">
            {$user.tags[id]?.name}
          </div>
        {/each}
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.em" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="currentColor" d="M15.62 21.12a3 3 0 0 1-4.24 0L3.05 13C2.45 12.45 2 11.63 2 10.75V6a3 3 0 0 1 3-3h4.75c.88 0 1.7.45 2.25 1.05l8.07 8.38a3 3 0 0 1 0 4.24zm-.71-.71l4.45-4.45c.78-.78.78-2.05 0-2.83l-8.25-8.55C10.78 4.2 10.3 4 9.75 4l-4.78-.03C3.87 3.97 3 4.9 3 6v4.75c0 .55.2 1.03.58 1.36l8.5 8.3c.78.78 2.05.78 2.83 0M6.5 5A2.5 2.5 0 0 1 9 7.5A2.5 2.5 0 0 1 6.5 10A2.5 2.5 0 0 1 4 7.5A2.5 2.5 0 0 1 6.5 5m0 1A1.5 1.5 0 0 0 5 7.5A1.5 1.5 0 0 0 6.5 9A1.5 1.5 0 0 0 8 7.5A1.5 1.5 0 0 0 6.5 6" />
        </svg>
        <!-- {@render circle('var(--placeholder-color)')} -->
      {/if}
    </button> 
  {/snippet}

  {#snippet content ()}
    <div class="flex flex-col gap-y-1 py-1 px-1 min-w-[240px]">
      {#if $user.tags}
        {#each Object.entries($user.tags) as [id, tag] (id)}  
          {@const selected = task.tagIDs?.includes(id)}
          <div 
            class="flex items-center gap-x-1"
            style:background-color={selected ? 'rgb(230, 230, 230)' : ''}
            style:border-radius="8px"
          >
            <button onclick={() => toggleTag(id)}
              style:opacity={selected ? '1' : '0.5'}
              style:filter="grayscale({ selected ? '0%' : '10%'})"
              style:color={selected ? 'black' : 'grey'}
              class="grow flex justify-start gap-x-2 px-1"
            >
              {@render circle(tag.color, '1.125rem')}

              <div>{tag.name}</div>
            </button>

            <PopoverMenu>
              {#snippet activator({ id, anchorName })}
                <button popovertarget={id} style:anchor-name={anchorName}>
                  <MslMoreVert style="font-size: 1.5rem;"/>
                </button>
              {/snippet}

              {#snippet content({ close })}
                <div class="flex flex-wrap py-1 px-2">
                  {#each presetColors as color}
                    <div onclick={() => { editTag(id, { color }); close() }} 
                      class="w-[24px] h-[24px]" 
                      style:background-color={color}
                    >
                    </div>
                  {/each}
                </div>
            
                <div class="py-1 px-2">
                  <input placeholder="Edit name" 
                    onkeyup={e => {
                      if (e.key === 'Enter') {
                        editTag(id, { name: e.target.value });
                        close();
                      }
                    }} 
                    style:field-sizing="content"
                  >
                </div>
            
                <div class="py-1 px-2">
                  <button onclick={() => deleteColorTag({ tagID: id, user: $user })}>
                    Delete
                  </button>  
                </div>
              {/snippet}
            </PopoverMenu>
          </div>
        {/each}
      {/if}
      
      <div class="py-1 px-2">
        <input {value} {onkeyup} 
          oninput={e => value = e.target.value}
          placeholder="new tag"
          size="0"
        >
      </div>
    </div>
  {/snippet}
</PopoverMenu>

{#snippet circle (color, size = '5px')}
  <div style="background-color: {color}; border-radius: 50%; width: {size}; height: {size};"></div>
{/snippet}