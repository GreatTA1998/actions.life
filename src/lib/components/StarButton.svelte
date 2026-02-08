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
    <MslStar class="star-icon"/>
  {:else}
    <MslStarOutline class="star-icon"/>
  {/if}
</button>

<style>
  .star-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    transition: background 0.15s;
    flex-shrink: 0;
  }

  /* global needed otherwise Uniconify's icons become black */
  :global(.star-icon) {
    font-size: 2.2rem;
    color: #666;
  }

  .star-button.starred :global(.star-icon) {
    color: #ffa726;
  }
</style>
