<script>
  let { children } = $props()
</script>

<div class="toggle-group">
  {@render children()}
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
</style>
