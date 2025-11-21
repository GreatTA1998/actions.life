<script>
  let { isStarred = false, onToggle } = $props()
</script>

<button 
  onclick={onToggle}
  class="star-button"
  class:starred={isStarred}
>
  <span class="material-symbols-outlined star-icon">
    {isStarred ? 'star' : 'star_border'}
  </span>
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

  .star-icon {
    font-size: var(--font-size-xl, 1.25rem);
    color: #666;
    transition: color 0.15s;
  }

  .star-button.starred .star-icon {
    color: #ffa726;
    font-variation-settings: 'FILL' 1;
  }
</style>

