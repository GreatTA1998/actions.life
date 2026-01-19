<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import { paddingVal } from '$lib/styles/reused.module.css'

  let { value, oninput } = $props()

  const durations = [
    { label: '1m', value: 1 },
    { label: '2m', value: 2 },
    { label: '5m', value: 5 },
    { label: '10m', value: 10 },
    { label: '15m', value: 15 },
    { label: '20m', value: 20 },
    { label: '30m', value: 30 },
    { label: '40m', value: 40 },
    { label: '1hr', value: 60 },
    { label: '2hr', value: 120 },
    { label: '3hr', value: 180 },
    { label: '4hr', value: 240 }
  ];

  function select (duration, close) {
    if (oninput) {
      oninput({ target: { value: duration.value } });
    }
    close();
  }
</script>

<PopoverMenu {activator} {content} />

{#snippet activator({ open, close, setPosition })}
  <div style="
    position: relative; display: inline-flex; align-items: center;
    padding: 0px {paddingVal};"
  >
    <input {value} {oninput}
      onclick={open}
      type="number" 
      pattern="[0-9]*"
      max="1000"
      min="0"
    >
    <div class="suffix">
      m
    </div>
  </div>
{/snippet}

{#snippet content({ open, close, setPosition })}
  <div class="duration-options">
    {#each durations as duration}
      <button onclick={() => select(duration, close)}
        class="duration-button" 
        class:highlighted-option={value === duration.value}
      >
        {duration.label}
      </button>
    {/each}
  </div>
{/snippet}

<style>
  input {
    display: block;
    field-sizing: content;
    border: 0px solid #e0e0e0;
    border-radius: 6px;
    outline: none;
    transition: border-color 0.2s;

    font-size: 0.875rem;
    color: var(--scheduled-info-color);
  }

  input:focus {
    border-color: #007bff;
  }

  /* Remove spinner buttons */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type=number] {
    -moz-appearance: textfield;
  }

  .suffix {
    color: var(--scheduled-info-color);
    font-size: 0.875rem;
    pointer-events: none;
  }

  .duration-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 8px;
    max-width: 240px;
  }

  .duration-button {
    padding: 6px 10px;
    font-size: 14px;
    border-radius: 4px;
    color: #727272;
  }
</style>