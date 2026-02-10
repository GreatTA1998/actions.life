<script>
  import { DateTime } from 'luxon'
  import { untrack } from 'svelte'
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import DatePicker from './DatePicker.svelte'
  import { paddingVal, placeholderField } from '$lib/styles/reused.module.css'

  let {
    startDateISO = null,
    ondateselected = () => {}
  } = $props()

  let button = $state(null)
  let selected = $state(null)
  let display = $derived(selected ? selected.toFormat('yyyy-MM-dd') : '')

  $effect(() => {
    if (startDateISO) {
      const iso = startDateISO
      
      untrack(() => {
        try {
          const parsed = DateTime.fromISO(iso)
          // Update selected if it's different
          if (!selected || !parsed.hasSame(selected, 'day')) {
            selected = parsed
          }
        } catch {
          selected = null
        }
      })
    }
  })

  function handleDateSelected ({ mmdd, yyyy }) {
    if (!mmdd || !yyyy) selected = null
    else {
      const [month, day] = mmdd.split('/').map(Number)
      const year = Number(yyyy)
      selected = DateTime.fromObject({ year, month, day })
    }
    ondateselected({ mmdd, yyyy })
  }
</script>

<PopoverMenu>
  {#snippet activator({ id, anchorName })}
    <button bind:this={button} popovertarget={id} style:anchor-name={anchorName}>
      <input onclick={() => button.click()} 
        readonly 
        value={display}
        placeholder="Year and Date" 
        class="input {placeholderField}" 
        style:padding="0 {paddingVal}"
      >
    </button>
  {/snippet}

  {#snippet content({ close })}
    <DatePicker
      {selected}
      ondateselected={handleDateSelected}
      onclose={close}
    />
  {/snippet}
</PopoverMenu>

<style>
  .input {
    field-sizing: content;
    min-width: 80px;
    padding: 2px;
    border-radius: 4px;
  }
</style>
