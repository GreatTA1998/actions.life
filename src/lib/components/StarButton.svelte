<script>
  import MslStar from 'virtual:icons/material-symbols-light/star'
  import MslStarOutline from 'virtual:icons/material-symbols-light/star-outline'
  let { isStarred = false, onToggle } = $props()
</script>

<button 
  onclick={onToggle}
  class="star-button"
  class:starred={isStarred}
>
  {#if isStarred}
    <MslStar class="star-icon" style="font-size: 2.2rem;"/>
  {:else}
    <MslStarOutline class="star-icon" style="font-size: 2.2rem;"/>
  {/if}
</button>

<style>
  .star-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    background: transparent;
    border-radius: 4px;
    transition: background 0.15s;
    flex-shrink: 0;
  }

  .star-button:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  :global(.star-icon) {
    font-size: var(--font-size-xl, 1.25rem);
    color: #666;
    transition: color 0.15s;
  }

  .star-button.starred :global(.star-icon) {
    color: #ffa726;
  }
</style>
