<script>
  import BasicWhiteboard from './BasicWhiteboard.svelte'
  import Icon from '$lib/db/models/Icon.js'
  import Template from '$lib/db/models/Template.js'
  import { template } from '../../store.js'
  import { doodleIcons } from '$lib/store'
  import { getContext } from 'svelte'

  const { user } = getContext('app')
  
  onMount(async () => {
    const temp = await Icon.getAvailable($user.uid) 
    doodleIcons.set(temp)
  })

  async function handleSelectIcon (iconURL = '') {
    Template.updateItselfAndFutureInstances({ id: $template.id, updates: { iconURL } })
  }

  function handleDeleteIcon({ id, url }) {
    if (confirm('Are you sure you want to delete this icon?')) {
      Icon.deleteRecursively({ id, uid: $user.uid, url })
      $doodleIcons = $doodleIcons.filter((icon) => icon.id !== id)
    }
  }
</script>

<div style="margin-top: 16px; display: flex; width: 100%; flex-wrap: wrap;">
  {#if $doodleIcons}
    {#each $doodleIcons as doodleIcon}
      <div style="position: relative;">
        <button on:click={() => handleSelectIcon($template.iconURL === doodleIcon.url ? '' : doodleIcon.url)}>
          <img src={doodleIcon.url}
            style="width: 48px; height: 48px;"
            class:orange-border={$template.iconURL === doodleIcon.url}
            alt="hand-drawn icon"
          />
        </button>

        {#if doodleIcon.createdBy === $user.uid && $template.iconURL === doodleIcon.url}
          <button on:click={() => handleDeleteIcon({ doodleIcon }) } class="delete">
            <span class="material-symbols-outlined">delete</span>
          </button>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<div style="margin-top: 16px; display: flex; justify-content: center">
  <BasicWhiteboard />
</div>

<style>
  .orange-border {
    border: 1px solid var(--logo-twig-color);
    background-image: linear-gradient(
        90deg,
        rgba(200, 200, 200, 0.8) 1px,
        transparent 0
      ),
      linear-gradient(180deg, rgba(200, 200, 200, 0.8) 1px, transparent 0);
    background-size: 12px 12px; 
  }

  .delete {
    position: absolute;
    bottom: -4px;
    right: -4px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #ddd;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    padding: 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .delete span {
    font-size: 12px;
  }
</style>
