<script>
  import { DateTime } from 'luxon'
  import { onMount } from 'svelte'

  // Props - maintaining backward compatibility
  export let startDateISO = null
  export let willOpen = false
  export let ondateselected = () => {}
  export let inline = false // new: inline vs popup mode

  // State
  let isOpen = false
  let selectedDate = null
  let viewingMonth = DateTime.now().startOf('month')
  let inputRef = null

  // Initialize from startDateISO
  $: if (startDateISO) {
    try {
      selectedDate = DateTime.fromISO(startDateISO)
      viewingMonth = selectedDate.startOf('month')
    } catch {
      selectedDate = null
    }
  }

  onMount(() => {
    if (willOpen) isOpen = true
  })

  // Format for display: "Jul 19"
  $: displayValue = selectedDate 
    ? selectedDate.toFormat('MMM d')
    : ''

  // Generate calendar grid (42 days: 6 weeks × 7 days)
  $: calendarDays = (() => {
    const firstDay = viewingMonth.startOf('month')
    const startOfGrid = firstDay.startOf('week')
    
    return Array.from({ length: 42 }, (_, i) => {
      const date = startOfGrid.plus({ days: i })
      return {
        date,
        isCurrentMonth: date.month === viewingMonth.month,
        isToday: date.hasSame(DateTime.now(), 'day'),
        isSelected: selectedDate?.hasSame(date, 'day') ?? false
      }
    })
  })()

  function handleDateClick(day) {
    if (day.isSelected) {
      // Unselect: click selected date again
      selectedDate = null
      ondateselected({ mmdd: '', yyyy: '' })
      if (!inline) isOpen = false
    } else {
      // Select new date
      selectedDate = day.date
      const mmdd = day.date.toFormat('MM/dd')
      const yyyy = day.date.year
      ondateselected({ mmdd, yyyy })
      if (!inline) isOpen = false
    }
  }

  function goToPrevMonth() {
    viewingMonth = viewingMonth.minus({ months: 1 })
  }

  function goToNextMonth() {
    viewingMonth = viewingMonth.plus({ months: 1 })
  }

  function goToToday() {
    const today = DateTime.now()
    selectedDate = today
    viewingMonth = today.startOf('month')
    const mmdd = today.toFormat('MM/dd')
    const yyyy = today.year
    ondateselected({ mmdd, yyyy })
    if (!inline) isOpen = false
  }

  function toggleCalendar() {
    if (!inline) isOpen = !isOpen
  }

  // Close on outside click
  function handleOutsideClick(e) {
    if (!inline && isOpen && !e.target.closest('.datepicker-container')) {
      isOpen = false
    }
  }

  // Keyboard: Escape to close
  function handleKeydown(e) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false
    }
  }
</script>

<svelte:window on:click={handleOutsideClick} on:keydown={handleKeydown} />

<div class="datepicker-container" class:inline>
  {#if !inline}
    <input
      bind:this={inputRef}
      class="date-input"
      value={displayValue}
      on:click={toggleCalendar}
      inputmode="none"
      placeholder="MM/dd"
      readonly
    />
  {/if}

  {#if inline || isOpen}
    <div class="calendar" class:popup={!inline}>
      <div class="calendar-header">
        <button type="button" class="nav-btn" on:click={goToPrevMonth}>‹</button>
        <div class="month-year">
          {viewingMonth.toFormat('MMMM yyyy')}
        </div>
        <button type="button" class="nav-btn" on:click={goToNextMonth}>›</button>
      </div>

      <div class="weekdays">
        {#each ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as day}
          <div class="weekday">{day}</div>
        {/each}
      </div>

      <div class="days-grid">
        {#each calendarDays as day}
          <button
            type="button"
            class="day"
            class:other-month={!day.isCurrentMonth}
            class:today={day.isToday}
            class:selected={day.isSelected}
            on:click={() => handleDateClick(day)}
          >
            {day.date.day}
          </button>
        {/each}
      </div>

      <div class="calendar-footer">
        <button type="button" class="today-btn" on:click={goToToday}>
          Today
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .datepicker-container {
    position: relative;
    display: inline-block;
  }

  .date-input {
    height: 30px;
    width: 64px;
    padding: 2px;
    border: 0px solid transparent;
    border-radius: 4px;
    font-size: 14px;
    color: var(--scheduled-info-color, #666);
    background: transparent;
    cursor: pointer;
  }

  .date-input:focus {
    outline: none;
  }

  .calendar {
    background: var(--popup-bg, white);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 12px;
    user-select: none;
    min-width: 280px;
  }

  .calendar.popup {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    z-index: 1000;
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    gap: 8px;
  }

  .month-year {
    font-weight: 600;
    font-size: 15px;
    flex: 1;
    text-align: center;
    color: var(--text-primary, #000);
  }

  .nav-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 4px 8px;
    color: var(--text-secondary, #666);
    border-radius: 4px;
    line-height: 1;
  }

  .nav-btn:hover {
    background: var(--hover-bg, #f0f0f0);
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

  .days-grid {
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

  .calendar-footer {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--border-color, #eee);
  }

  .today-btn {
    width: 100%;
    padding: 8px;
    border: none;
    background: var(--secondary-bg, #f5f5f5);
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-primary, #000);
    font-weight: 500;
  }

  .today-btn:hover {
    background: var(--hover-bg, #e8e8e8);
  }

  /* Inline mode: no popup styling */
  .datepicker-container.inline .calendar {
    position: static;
    box-shadow: none;
  }
</style>

