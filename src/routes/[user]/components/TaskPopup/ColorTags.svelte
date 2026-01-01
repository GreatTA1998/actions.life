<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import Task from '$lib/db/models/Task';
  import User from '$lib/db/models/User'
  import { user } from '$lib/store'
  import { getRandomID, getRandomColor } from '$lib/utils/core.js'

  let { taskObject } = $props()

  let input = $state(false)
  let value = $state('')

  function onkeyup (e) {
    if (e.key === 'Enter') {
      const copy = { ...$user.tags }
      const id = getRandomID()
      copy[id] = {
        color: getRandomColor(),
        name: e.target.value
      }

      User.update({ tags: copy })
      Task.update({
        tagIDs: [...(taskObject.tagIDs || []), id] 
      })
      value = ''
    }
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
      {@render circle('var(--experimental-black')}
    {/if}
  </button> 
{/snippet}

{#snippet content ()}
  <div onclick={() => input = true} style="height: fit-content; width: 240px; padding: 4px;">
    {#if ($user.tags)}
      {#each Object.entries($user.tags) as [id, tag] (id)}
        <div class="flexbox content-center" style="column-gap: 4px;">
          {@render circle(tag.color)}
          <div>{tag.name}</div>
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
  <div class="circle" style="background-color: {color}"></div>
{/snippet}

<style>
  .circle {
    border-radius: 50%;
    width: 6px;
    height: 6px;
  }
</style>