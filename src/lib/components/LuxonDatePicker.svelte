<script>
  import { DateTime } from 'luxon'
  import { untrack } from 'svelte'
  import Popover from './Popover.svelte'
  import DatePicker from './DatePicker.svelte'
  import { paddingVal, fieldWithPlaceholder } from '$lib/styles/reused.module.css'

  let {
    startDateISO = null,
    willOpen = false,
    ondateselected = () => {}
  } = $props()

  let selected = $state(null)
  let display = $derived(selected ? selected.toFormat('yyyy-MM-dd') : '')

  $effect(() => {
    if (startDateISO) {
      // Capture dependency
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

<Popover {willOpen}>
  {#snippet activator({ setButtonRef, open, toggle, id })}
    <input value={display}
      popovertarget={id}
      onclick={toggle}
      use:setButtonRef
      placeholder="Year and Date"
      class="input {fieldWithPlaceholder}"
      style="padding: 0 {paddingVal};"
    >
  {/snippet}

  {#snippet content({ close })}
    <DatePicker
      selected={selected}
      ondateselected={handleDateSelected}
      onclose={close}
    />
  {/snippet}
</Popover>

<style>
  .input {
    border: none;
    field-sizing: content;
    min-width: 80px;
    padding: 2px;
    border-radius: 4px;
    font-size: 14px;
    color: var(--scheduled-info-color, #666);
    background: transparent;
    cursor: pointer;
    text-align: left;
  }

  .input:focus {
    outline: none;
  }
</style>
