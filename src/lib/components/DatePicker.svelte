<script>
  import { DateTime } from 'luxon'
  import { untrack } from 'svelte'
  import MonthYearNavigator from './MonthYearNavigator.svelte'

  let {
    selected = null,
    ondateselected = () => {},
    onclose = () => {},
    inline = false
  } = $props()

  // Internal month state - sync to selected date when it changes
  let month = $state(DateTime.now().startOf('month'))

  // Sync month to selected date when it changes externally
  $effect(() => {
    if (selected) {
      untrack(() => {
        const newMonth = selected.startOf('month')
        if (!month.hasSame(newMonth, 'month')) {
          month = newMonth
        }
      })
    }
  })

  // Generate calendar grid
  let days = $derived.by(() => {
    const firstDay = month.startOf('month')
    const lastDay = month.endOf('month')
    const startOfGrid = firstDay.startOf('week')
    const endOfGrid = lastDay.endOf('week')
    
    const grid = []
    let current = startOfGrid
    
    while (current <= endOfGrid) {
      grid.push({
        date: current,
        isCurrentMonth: current.month === month.month,
        isToday: current.hasSame(DateTime.now(), 'day'),
        isSelected: selected?.hasSame(current, 'day') ?? false
      })
      current = current.plus({ days: 1 })
    }
    
    return grid
  })

  function selectDate(day) {
    if (day.isSelected) {
      ondateselected({ mmdd: '', yyyy: '' })
    } else {
      ondateselected({ 
        mmdd: day.date.toFormat('MM/dd'), 
        yyyy: day.date.year 
      })
    }
    // Only call onclose if not inline (for popover usage)
    if (!inline) {
      onclose()
    }
  }
</script>

<div class="cal">
  <MonthYearNavigator bind:month />

  <div class="weekdays">
    {#each ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as day}
      <div class="weekday">{day}</div>
    {/each}
  </div>

  <div class="grid">
    {#each days as day}
      <button
        type="button"
        class="day"
        class:other-month={!day.isCurrentMonth}
        class:today={day.isToday}
        class:selected={day.isSelected}
        onclick={() => selectDate(day)}
      >
        {day.date.day}
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
    --touch-target: clamp(44px, 10vw, 48px);
    
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
    margin-bottom: var(--gap);
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

  .day {
    aspect-ratio: 1;
    border: none;
    background: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: var(--font-size);
    color: var(--text-primary, #000);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--touch-target);
    min-width: var(--touch-target);
    transition: all 0.15s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .day:hover {
    background: var(--hover-bg, #f0f0f0);
  }

  .day.other-month {
    color: var(--text-disabled, #ccc);
  }

  .day.today {
    font-weight: 700;
    color: var(--primary-color, #007aff);
  }

  .day.selected {
    background: var(--primary-color, #007aff);
    color: white;
    font-weight: 600;
  }

  .day.selected:hover {
    background: var(--primary-dark, #0056b3);
  }
</style>

