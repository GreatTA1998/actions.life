<script>
  export let value
  export let onClick

  export let label
</script>

<label class="toggle-label">
  <input 
    type="checkbox" 
    class="checkbox" 
    checked={value}
    on:click|stopPropagation={onClick}
  >
  <span class="checkbox-text">{label}</span>
</label>

<style>
  .toggle-label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .checkbox {
    margin-right: 8px;
    accent-color: #555;
    cursor: pointer;
  }

  .checkbox-text {
    font-size: 13px;
    color: #555;
  }
</style>
