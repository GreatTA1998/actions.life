<script>
  import { DateTime } from 'luxon'
  import { untrack } from 'svelte'
  import Popover from './Popover.svelte'
  import DatePicker from './DatePicker.svelte'

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

<div class="picker">
  <Popover {willOpen}>
    {#snippet activator({ setButtonRef, close })}
      <button
        use:setButtonRef
        type="button"
        popovertarget="popover"
        class="input"
      >
        {display || 'date'}
      </button>
    {/snippet}

    {#snippet content({ close })}
      <DatePicker
        selected={selected}
        ondateselected={handleDateSelected}
        onclose={close}
      />
    {/snippet}
  </Popover>
</div>

<style>
  .picker {
    position: relative;
    display: inline-block;
  }

  .input {
    height: 30px;
    width: fit-content;
    padding: 2px;
    border: 0;
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
