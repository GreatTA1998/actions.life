<script>
  import { DateTime } from 'luxon'
  import MonthYearNavigator from './MonthYearNavigator.svelte'

  let {
    selected = null,
    ondateselected = () => {},
    onclose = () => {}
  } = $props()

  let dt = $state(DateTime.now().startOf('month'))

  let days = $derived.by(() => {
    const grid = []
    const firstDay = dt.startOf('month')
    const lastDay = dt.endOf('month')
  
    let current = firstDay.startOf('week')
    while (current <= lastDay.endOf('week')) {
      grid.push({
        date: current,
        isCurrentMonth: current.month === dt.month,
        isToday: current.hasSame(DateTime.now(), 'day'),
        isSelected: selected?.hasSame(current, 'day') ?? false
      })
      current = current.plus({ days: 1 })
    }
    return grid
  })

  function selectDate (day) {
    if (day.isSelected) {
      ondateselected({ mmdd: '', yyyy: '' })
    } else {
      ondateselected({ 
        mmdd: day.date.toFormat('MM/dd'), 
        yyyy: day.date.year 
      })
    }
    onclose()
  }
</script>

<div class="cal">
  <MonthYearNavigator {dt} onChange={({ newVal }) => dt = newVal } />

  <div class="weekdays">
    {#each ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as day}
      <div class="weekday">{day}</div>
    {/each}
  </div>

  <div class="grid">
    {#each days as day}
      <button onclick={() => selectDate(day)}
        class="day"
        class:other-month={!day.isCurrentMonth}
        class:today={day.isToday}
        class:selected={day.isSelected}
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

  .day {
    aspect-ratio: 1;
    border-radius: 8px;
    font-size: var(--font-size);
    color: var(--text-primary, #000);
    justify-content: center;
    width: var(--touch-target);
    height: var(--touch-target);
    min-height: var(--touch-target);
    min-width: var(--touch-target);
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .day.other-month {
    color: var(--text-disabled, #ccc);
  }

  .day.today {
    font-weight: 700;
    color: var(--primary-color);
  }

  .day.selected {
    background: var(--primary-color);
    color: white;
    font-weight: 600;
  }
</style>

