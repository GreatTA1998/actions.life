<script>
  import { DateTime } from 'luxon'
  import MonthYearMenus from './MonthYearMenus.svelte'

  let {
    valueDT = null,
    onChange = () => {},
    onVisibilityChange = () => {},
    onclose = () => {}
  } = $props()

  let visibleMonthDT = $derived(valueDT ?? DateTime.now())

  let days = $derived.by(() => {
    const grid = []
    let current = visibleMonthDT.startOf('month')
    while (current <= visibleMonthDT.endOf('month')) {
      grid.push(current)
      current = current.plus({ days: 1 })
    }
    return grid
  })

  function selectDate (dayDT) {
    if (dayDT.toISODate() === valueDT?.toISODate()) {
      onChange('') 
    } else {
      onChange(dayDT.toISODate())
    }
    onclose()
  }
</script>

<div class="cal">
  <MonthYearMenus dt={visibleMonthDT} onChange={({ newVal }) => {
    const { year, month } = newVal
    let dt = visibleMonthDT.set({ year })
    dt = dt.set({ month })
    visibleMonthDT = dt
    onVisibilityChange({ year, month })
  }} />

  <div class="weekdays">
    {#each ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as day}
      <div class="weekday">{day}</div>
    {/each}
  </div>

  <div class="grid">
    {#each days as dayDT, i}
      <button onclick={() => selectDate(dayDT)}
        style:grid-column-start={i === 0 ? dayDT.weekday : ''}
        class:font-bold={dayDT.hasSame(DateTime.now(), 'day')}
        class:selected={dayDT.toISODate() === valueDT?.toISODate()}
        class="w-[36px] h-[36px] justify-center rounded-lg"
      >
        {dayDT.day}
      </button>
    {/each}
  </div>
</div>

<style>
  .cal {
    /* Base sizing */
    --font-size: clamp(16px, 4vw, 18px);
    --font-size-large: clamp(18px, 4.5vw, 22px);
    --font-size-small: clamp(12px, 3vw, 14px);
    --spacing: clamp(8px, 2vw, 12px);
    --gap: clamp(4px, 1vw, 6px);
    --touch-target: 36px; /* Minimum tappable size for mobile (Microsoft standard, common for date pickers) */
    
    /* Derived values */
    --cal-width: clamp(320px, 90vw, 400px);
    --cal-padding: var(--spacing);
    
    padding: var(--cal-padding);
    user-select: none;
    width: var(--cal-width);
    max-width: min(90vw, 400px);
  }


  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--gap);
  }

  .weekday {
    text-align: center;
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--text-secondary, #999);
    padding: var(--gap);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--gap);
  }

  .other-month {
    color: var(--text-disabled, #ccc);
  }

  .selected {
    background: var(--primary-color);
    color: white;
    font-weight: 600;
  }
</style>

