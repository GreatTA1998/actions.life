<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import { paddingVal, noZoomFS, placeholderField } from '$lib/styles/reused.module.css'

  let { value, oninput } = $props()

  let button = $state(null)

  const durations = [
    { label: '1m', value: 1 },
    { label: '2m', value: 2 },
    { label: '5m', value: 5 },
    { label: '10m', value: 10 },
    { label: '15m', value: 15 },
    { label: '20m', value: 20 },
    { label: '30m', value: 30 },
    { label: '40m', value: 40 },
    { label: '50m', value: 50 },
    { label: '60m', value: 60 },
    { label: '90m', value: 90 },
    { label: '120m', value: 120 },
  ];

  function select (duration, close) {
    if (oninput) {
      oninput({ target: { value: duration.value } })
    }
    close()
  }
</script>

<PopoverMenu>
  {#snippet activator({ id, anchorName, close })}
    <button bind:this={button}
      popovertarget={id}
      style:anchor-name={anchorName}
      style:padding="0px {paddingVal}"
      style:font-size={noZoomFS}
    >
      <input onclick={() => button.click()}
        {value} {oninput} onblur={() => setTimeout(close, 300)}
        class={placeholderField}
        type="number" 
        pattern="[0-9]*"
        min="0"
      >
      <span class="pointer-events-none">
        m
      </span>
    </button>
  {/snippet}

  {#snippet content({ close })}
    <div class="grid gap-2 p-2" style:grid-template-columns="repeat(3, 1fr)">
      {#each durations as duration}
        <button onclick={() => select(duration, close)}
          class={[
            'rounded py-2 px-3', 
            placeholderField,
            value === duration.value ? 'font-semibold' : `text-neutral-500`
          ]}
        >
          {duration.label}
        </button>
      {/each}
    </div>
  {/snippet}
</PopoverMenu>

<style>
  input {
    field-sizing: content;
    border-radius: 6px;
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
</style>