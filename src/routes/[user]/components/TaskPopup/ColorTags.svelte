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

  function autofocus (node) {
    node.focus()
  }

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

<PopoverMenu {activator} {content} />

{#snippet activator ({ popovertarget })}
  <button {popovertarget} 
    class="flexbox items-center" 
    style="
      column-gap: 4px; 
      min-width: 16px; 
      min-height: 16px;
      width: fit-content;
      align-items: center; 
      justify-content: center; 
      border-radius: 4px; 
      padding: 0px {paddingVal};
    "
    style:anchor-name="--anchor-{popovertarget}"
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
  <div style="height: fit-content; width: fit-content; padding: 4px; display: flex; flex-direction: column; row-gap: 4px;">
    {#if $user.tags}
      {#each Object.entries($user.tags) as [id, tag] (id)}
        <button 
          class="flexbox items-center" 
          class:selected={task.tagIDs?.includes(id)}
          style="column-gap: 4px;"
        >
          <ColorPicker type="color" value={tag.color} onchange={updateColor} />
          <!-- {@render circle(tag.color)} -->
          <div onclick={() => toggleTag(id)}>{tag.name}</div>
          {@render menu(id)}
        </button>
      {/each}
    {/if}

    <button popovertarget="new-tag-popover" style="anchor-name: --anchor-new-tag; height: 20px; min-width: 48px; width: 100%; border: 1px solid red;">
      <!-- problem: if you use popovertarget, without a reference to JS and tracking states, you can't autofocus -->
      <!-- however you could make it a component, and let it trigger on an open -->
      <div popover id="new-tag-popover" style="position: absolute; position-area: center;">
        <input use:autofocus {value} oninput={e => value = e.target.value} {onkeyup}>
      </div>
    </button>
  </div>
{/snippet}

{#snippet circle (color)}
  <div style="background-color: {color}; border-radius: 50%; width: 5px; height: 5px;"></div>
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
    <button>Edit</button>
    <button onclick={() => deleteColorTag({ tagID: id, user: $user })}>
      Delete
    </button>    
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

<style>
  [popover] {
    margin: 0;
    inset: unset; 
  }

  .selected {
    background-color: rgba(0, 0, 0);
    color: white;
    border-radius: 4px;
  }
</style>