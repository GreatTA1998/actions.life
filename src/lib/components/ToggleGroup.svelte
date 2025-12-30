<script>
  import ToggleGroupStyled from '$lib/components/ToggleGroupStyled.svelte'
  let {
    onselect,
    options = [],
    activeValue
  } = $props()
</script>

<ToggleGroupStyled>
  {#each options as option}
    <button onclick={() => onselect(option.value)} class="toggle-btn" class:active={option.value === activeValue}>
      {option.text}
    </button>
  {/each}
</ToggleGroupStyled>

<style>

  .toggle-btn {
    flex: 1;
    padding: 6px 0;
    color: #6e6e7a;
    border-radius: 4px;
    font-size: 0.875rem;
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