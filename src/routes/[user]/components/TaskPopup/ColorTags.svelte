<script>
  import ColorPicker from './ColorPicker.svelte'
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import Task from '$lib/db/models/Task';
  import User from '$lib/db/models/User'
  import MslMoreVert from 'virtual:icons/material-symbols-light/more-vert'
  import { deleteColorTag } from '$lib/db/helpers.js'
  import { user } from '$lib/store'
  import { getRandomID, getRandomColor } from '$lib/utils/core.js'
  import { paddingVal } from '$lib/styles/reused.module.css'

  let { task } = $props()

  let value = $state('')

  function onkeyup (e) {
    if (e.key === 'Enter') {
      if (value === '') {
        return
      }
      const copy = { ...$user.tags }
      const id = getRandomID()
      copy[id] = {
        color: getRandomColor(),
        name: e.target.value
      }

      User.update({ tags: copy })
      Task.update({
        id: task.id,
        keyValueChanges: {
          tagIDs: [...(task.tagIDs || []), id] 
        }
      })
      value = ''
    }
  }

  function updateColor (e) {
    console.log(e.target.value)
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
      keyValueChanges: kvChanges
    })
  }
</script>

<PopoverMenu>
  {#snippet activator ({ id, anchorName })}
    <button popovertarget={id}
      class="flexbox items-center gap-x-1 min-w-[16px] min-h-[16px] justify-center rounded" 
      style:anchor-name={anchorName}
      style:padding="0px {paddingVal}"
    >
      {#if (task.tagIDs?.length > 0)}
        {#each task.tagIDs as id}
          {@render circle($user.tags[id].color)}
        {/each}
      {:else}
        {@render circle('var(--experimental-black)')}
      {/if}
    </button> 
  {/snippet}

  {#snippet content ()}
    <div class="flexbox flex-col gap-y-1 py-1 px-2 min-w-[240px]">
      {#if $user.tags}
        {#each Object.entries($user.tags) as [id, tag] (id)}  
        {@const selected = task.tagIDs?.includes(id)}
          <div class="flexbox items-center gap-x-1">
            <button onclick={() => toggleTag(id)}
              style:opacity={selected ? '1' : '0.5'}
              style:color={selected ? 'black' : 'grey'}
              class="grow flexbox gap-x-2"
            >
              {@render circle(tag.color, '1.125rem')}

              <div>
                {tag.name}
              </div>
            </button>

            {@render menu(id)}
          </div>
        {/each}
      {/if}
      
      <div>
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

{#snippet menu (id)}
  <div popover id="popover-{id}" 
    style="
      position: absolute;
      position-anchor: --anchor-{id};
      left: anchor(right);
      top: anchor(top);
      position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    "
  >  
    <div>
      <button>Edit color</button>
    </div>
    <div>
      <button>Edit name</button>
    </div>
    <div>
      <button onclick={() => deleteColorTag({ tagID: id, user: $user })}>
        Delete
      </button>  
    </div>
  </div>

  <button popovertarget="popover-{id}" 
    style="
      height: fit-content; 
      display: flex;
      anchor-name: --anchor-{id};
    ">
    <MslMoreVert style="font-size: 1.5rem;"/>
  </button>
{/snippet}