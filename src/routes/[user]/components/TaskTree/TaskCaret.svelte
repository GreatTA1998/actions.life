<script>
  export let isCollapsed = false
  export let onToggle = () => {}
</script>

<button class="caret-button" on:click={onToggle}>
  <span class="material-symbols-outlined caret-icon">
    {isCollapsed ? 'chevron_right' : 'expand_more'}
  </span>
</button>

<style>
  .caret-button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 12.5px;
    width: 12.5px;
  }

  .caret-icon {
    font-size: 30px;
    color: var(--fine-control-color);
    font-weight: 100;
    pointer-events: none; /* without this, the touch area for this button is based on this large icon, not the small button that contains it */
  }
</style> 