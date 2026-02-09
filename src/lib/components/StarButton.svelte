<script>
  import MslStar from 'virtual:icons/material-symbols-light/star'
  import MslStarOutline from 'virtual:icons/material-symbols-light/star-outline'
  
  let { 
    isStarred = false, 
    onToggle 
  } = $props()
</script>

<button onclick={onToggle} class="shrink-0 justify-center p-1">
  {#if isStarred}
    <MslStar class="star-icon shine"/>
  {:else}
    <MslStarOutline class="star-icon"/>
  {/if}
</button>

<style>
  /* global needed otherwise Uniconify's icons become black */
  :global(.star-icon) {
    font-size: 2.2rem;
    color: #666;
  }

  .star-button.shine :global(.star-icon) {
    color: #ffa726;
  }
</style>
