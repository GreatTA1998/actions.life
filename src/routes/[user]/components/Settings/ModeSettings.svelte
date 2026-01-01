<script>
  import { user } from '$lib/store'
  import { getContext } from 'svelte'

  const { User } = getContext('app')
  
  let isSimple = $derived($user.simpleMode)
</script>

<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
  <div class="mode-toggle">
    <button onclick={() => User.update({ simpleMode: true })} 
      class="mode-button"
      class:active={isSimple}
    >
      Simple
    </button>
    <button onclick={() => User.update({ simpleMode: false })} 
      class="mode-button"
      class:active={!isSimple}
    >
      Structured
    </button>
  </div>

  <p class="mode-description">
    {#if isSimple}
      Tasks move between lists and calendar.
    {:else}
      Tasks persist on lists. Archive them manually.
    {/if}
  </p>
</div>

<style>

  .mode-toggle {
    display: flex;
    background: #f0f0f0;
    border-radius: 6px;
    padding: 3px;
  }

  .mode-button {
    border-radius: 4px;
    padding: 4px 12px;
    font-weight: 500;
    color: #777;
  }

  .mode-button.active {
    background: white;
    color: #333;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .mode-description {
    font-size: 1rem;
    margin: 0;
    padding: 0 8px;
  }
</style>
