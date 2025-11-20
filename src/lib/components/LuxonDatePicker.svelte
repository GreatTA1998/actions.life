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
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 12px;
    user-select: none;
    min-width: 280px;
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
    margin-bottom: 12px;
    gap: 8px;
  }

  .month-select,
  .year-select {
    font-weight: 600;
    font-size: 15px;
    padding: 4px 8px;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 4px;
    background: var(--popup-bg, white);
    color: var(--text-primary, #000);
    cursor: pointer;
  }

  .month-select {
    flex: 1;
  }

  .year-select {
    min-width: 80px;
  }

  .month-select:hover,
  .year-select:hover {
    background: var(--hover-bg, #f5f5f5);
  }

  .month-select:focus,
  .year-select:focus {
    outline: 2px solid var(--primary-color, #007aff);
    outline-offset: 2px;
  }

  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 4px;
  }

  .weekday {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary, #999);
    padding: 4px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .day {
    aspect-ratio: 1;
    border: none;
    background: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-primary, #000);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    transition: all 0.15s;
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

