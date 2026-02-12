<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import Task from '$lib/db/models/Task';
  import MslMoreVert from 'virtual:icons/material-symbols-light/more-vert'
  import { createColorTag, updateColorTag, deleteColorTag } from '$lib/db/helpers.js'
  import { user } from '$lib/store'
  import { getRandomID, getRandomColor } from '$lib/utils/core.js'
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

  async function onkeyup (e) {
    if (e.key === 'Enter') {
      const name = value.trim()
      if (name === '' || !$user.uid) {
        return
      }
      const id = getRandomID()
      await createColorTag({
        uid: $user.uid,
        tagID: id,
        tag: {
          color: getRandomColor(),
          name
        }
      })

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
      kvChanges: kvChanges
    })
  }

  function editTag (id, kvChanges) {
    updateColorTag({
      uid: $user.uid,
      tagID: id,
      kvChanges
    })
  }
</script>

<PopoverMenu>
  {#snippet activator ({ id, anchorName })}
    <button popovertarget={id}
      class="flex items-center gap-x-1 min-w-[16px] min-h-[16px] justify-center rounded" 
      style:anchor-name={anchorName}
      style:padding="0px {paddingVal}"
    >
      {#if (task.tagIDs?.length > 0)}
        {#each task.tagIDs as id}
          {@render circle($user.tags[id]?.color)}
        {/each}
      {:else}
        {@render circle('var(--experimental-black)')}
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
              class="grow flex gap-x-2 px-1"
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
                  <button onclick={() => deleteColorTag({ tagID: id, uid: $user.uid })}>
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
          type="text" placeholder="new tag"
          size="0"
        >
      </div>
    </div>
  {/snippet}
</PopoverMenu>

{#snippet circle (color, size = '5px')}
  <div style="background-color: {color}; border-radius: 50%; width: {size}; height: {size};"></div>
{/snippet}