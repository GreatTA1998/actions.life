<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'

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

{#snippet activator({ open, close, toggle })}
  <div class="duration-input">
    <input {value} {oninput}
      onclick={open}
      type="number" 
      pattern="[0-9]*"
      max="1000"
      min="0"
      placeholder="30"
    >
    <span class="suffix">
      min
    </span>
  </div>
{/snippet}

{#snippet content({ open, close, toggle })}
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
  .duration-input {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  input {
    max-width: 80px;
    height: 30px;
    padding: 8px 40px 8px 12px; /* extra padding on right for "min" */
    border: 0px solid #e0e0e0;
    border-radius: 6px;
    outline: none;
    transition: border-color 0.2s;

    font-size: 14px;
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
    position: absolute;
    right: 12px;
    color: var(--scheduled-info-color);
    font-size: 14px;
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
    background: none;
    border: none;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 14px;
    border-radius: 4px;
    color: #727272;
    text-align: center;
  }

  .highlighted-option {
    color: var(--scheduled-info-color);
    font-weight: 600;
  }
</style>