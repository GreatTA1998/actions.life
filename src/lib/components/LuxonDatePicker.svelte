<script>
  import { DateTime } from 'luxon'
  import { onMount } from 'svelte'

  // Props - maintaining backward compatibility
  export let startDateISO = null
  export let willOpen = false
  export let ondateselected = () => {}

  // State
  let selected = null
  let month = DateTime.now().startOf('month')
  let popover = null
  let inputButton = null

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const dt = DateTime.fromObject({ month: i + 1, day: 1 })
    return { value: i + 1, label: dt.toFormat('MMMM') }
  })

  // Generate year options (current year ± 10 years)
  $: years = (() => {
    const currentYear = DateTime.now().year
    const selectedYear = month.year
    const startYear = Math.min(currentYear, selectedYear) - 10
    const endYear = Math.max(currentYear, selectedYear) + 10
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  })()

  $: selectedMonth = month.month
  $: selectedYear = month.year

  // Initialize from startDateISO
  $: if (startDateISO) {
    try {
      selected = DateTime.fromISO(startDateISO)
      month = selected.startOf('month')
    } catch {
      selected = null
    }
  }

  function ontoggle(e) {
    if (e.newState === 'open' && popover && inputButton) {
      const rect = inputButton.getBoundingClientRect()
      popover.style.top = `${rect.bottom + 4}px`
      popover.style.left = `${rect.left}px`
    }
  }

  onMount(() => {
    if (willOpen && popover) {
      popover.showPopover()
    }
  })

  // Format for display: "Jul 19"
  $: display = selected ? selected.toFormat('MMM d') : ''

  // Generate calendar grid from first week to last week containing current month
  $: days = (() => {
    const firstDay = month.startOf('month')
    const lastDay = month.endOf('month')
    const startOfGrid = firstDay.startOf('week')
    const endOfGrid = lastDay.endOf('week')
    
    const days = []
    let current = startOfGrid
    
    while (current <= endOfGrid) {
      days.push({
        date: current,
        isCurrentMonth: current.month === month.month,
        isToday: current.hasSame(DateTime.now(), 'day'),
        isSelected: selected?.hasSame(current, 'day') ?? false
      })
      current = current.plus({ days: 1 })
    }
    
    return days
  })()

  function selectDate(day) {
    if (day.isSelected) {
      selected = null
      ondateselected({ mmdd: '', yyyy: '' })
      if (popover) popover.hidePopover()
    } else {
      selected = day.date
      ondateselected({ mmdd: day.date.toFormat('MM/dd'), yyyy: day.date.year })
      if (popover) popover.hidePopover()
    }
  }

  function handleMonthChange(e) {
    const newMonth = parseInt(e.target.value)
    month = month.set({ month: newMonth })
  }

  function handleYearChange(e) {
    const newYear = parseInt(e.target.value)
    month = month.set({ year: newYear })
  }
</script>

<div class="picker">
  <button
    bind:this={inputButton}
    type="button"
    popovertarget="popover"
    class="input"
  >
    {display || 'MM/dd'}
  </button>

  <div
    bind:this={popover}
    id="popover"
    popover="auto"
    class="cal popup"
    {ontoggle}
  >
    <div class="header">
      <select class="month-select" value={selectedMonth} onchange={handleMonthChange}>
        {#each months as m}
          <option value={m.value}>{m.label}</option>
        {/each}
      </select>
      <select class="year-select" value={selectedYear} onchange={handleYearChange}>
        {#each years as y}
          <option value={y}>{y}</option>
        {/each}
      </select>
    </div>

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
</div>

<style>
  .cal {
    /* Base sizing - adjust these to scale the entire component */
    --font-size: clamp(16px, 4vw, 18px);
    --font-size-large: clamp(18px, 4.5vw, 22px);
    --font-size-small: clamp(12px, 3vw, 14px);
    --spacing: clamp(8px, 2vw, 12px);
    --gap: clamp(4px, 1vw, 6px);
    --touch-target: clamp(44px, 10vw, 48px);
    
    /* Derived values */
    --cal-width: clamp(320px, 90vw, 400px);
    --cal-padding: var(--spacing);
  }

  .picker {
    position: relative;
    display: inline-block;
  }

  .input {
    height: 30px;
    width: 64px;
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

  .cal {
    background: var(--popup-bg, white);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: var(--cal-padding);
    user-select: none;
    width: var(--cal-width);
    max-width: min(90vw, 400px);
  }

  .cal.popup {
    position: fixed;
    inset: none;
    margin: 0;
    padding: 0;
    border: none;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--spacing);
    gap: var(--gap);
  }

  .month-select,
  .year-select {
    font-weight: 500;
    font-size: var(--font-size-large);
    padding: var(--spacing) 24px var(--spacing) 0;
    border: none;
    border-bottom: 1px solid var(--border-color, #ddd);
    background: transparent;
    color: var(--text-primary, #000);
    cursor: pointer;
    min-height: var(--touch-target);
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6' viewBox='0 0 6 6'%3E%3Cpath fill='%23999' d='M0 1.5l3 3 3-3z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 4px center;
    background-size: 6px;
    text-align: center;
  }

  .month-select {
    min-width: 120px;
  }

  .year-select {
    min-width: 80px;
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

