<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import Task from '$lib/db/models/Task';
  import User from '$lib/db/models/User'
  import MslMoreVert from 'virtual:icons/material-symbols-light/more-vert'
  import { deleteColorTag } from '$lib/db/helpers.js'
  import { user } from '$lib/store'
  import { getRandomID, getRandomColor } from '$lib/utils/core.js'

  let { taskObject } = $props()

  let input = $state(false)
  let value = $state('')

  function onkeyup (e) {
    if (e.key === 'Enter') {
      if (value === '') {
        input = false
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
        id: taskObject.id,
        keyValueChanges: {
          tagIDs: [...(taskObject.tagIDs || []), id] 
        }
      })
      value = ''
    }
  }

  function updateColor (e) {
    console.log(e.target.value)
  }

  function toggleTag (id) {
    const keyValueChanges = {}
    if (taskObject.tagIDs.includes(id)) {
      keyValueChanges.tagIDs = taskObject.tagIDs?.filter(elem => elem !== id) || [id]
    } else {
      keyValueChanges.tagIDs = [...(taskObject.tagIDs || []), id] 
    }
    Task.update({ 
      id: taskObject.id,
      keyValueChanges
    })
  }
</script>

<PopoverMenu {activator} {content} />

{#snippet activator ({ setPosition, popovertarget })}
  <button onclick={setPosition} {popovertarget} class="flexbox content-center" style="column-gap: 2px;">
    {#if (taskObject.tagIDs?.length > 0)}
      {#each taskObject.tagIDs as id}
        {@render circle($user.tags[id].color)}
      {/each}
    {:else}
      {@render circle('var(--experimental-black)')}
    {/if}
  </button> 
{/snippet}

{#snippet content ()}
  <div style="height: fit-content; width: 240px; padding: 4px;">
    {#if $user.tags}
      {#each Object.entries($user.tags) as [id, tag] (id)}
        <div class="flexbox content-center" style="column-gap: 4px;">
          <input type="color" value={tag.color} onchange={updateColor}>
          <!-- {@render circle(tag.color)} -->
          <div onclick={() => toggleTag(id)}>{tag.name}</div>
          {@render menu(id)}
        </div>
      {/each}
    {/if}

    <div onclick={() => input = true} style="height: 48px;">    
      {#if input}
        <input {value} oninput={e => value = e.target.value} {onkeyup}>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet circle (color)}
  <div style="background-color: {color}; border-radius: 50%; width: 6px; height: 6px;"></div>
{/snippet}

{#snippet menu (id)}
  <!-- TO-DO: anchor positioning  -->
  <div popover {id} style="width: fit-content; height: fit-content;">
    <button>Edit</button>
    <button onclick={() => deleteColorTag({ tagID: id, user: $user })}>
      Delete
    </button>    
  </div>

  <button popovertarget={id}>
    <MslMoreVert style="font-size: 1.5rem;"/>
  </button>
{/snippet}
