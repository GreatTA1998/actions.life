<script>
  import { createEventDispatcher } from 'svelte'

  export let options = [] 
  export let activeValue
  export let useIcons = false

  const dispatch = createEventDispatcher()
</script>

<div class="toggle-group">
  {#each options as option}
    <button on:click={() => dispatch('select', option)} class="toggle-btn" class:active={option.value === activeValue}>
      {#if useIcons}
        <span class="material-symbols-outlined">{option.icon}</span>
      {:else}
        {option.text}
      {/if}
    </button>
  {/each}
</div>

<style>
  .toggle-group {
    display: flex;
    background: #f6f6f7;
    border-radius: 6px;
    padding: 2px;
    gap: 0;
    margin: 4px 0;
  }

  .toggle-btn {
    flex: 1;
    padding: 6px 0;
    border: none;
    background: transparent;
    color: #6e6e7a;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .toggle-btn.active {
    background: #e3e6ee;
    color: #1a1a1a;
    font-weight: 500;
  }

  .toggle-btn:not(.active):hover {
    background: #ececf0;
    color: #444;
  }
</style>