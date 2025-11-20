<script>
  import { DateTime } from 'luxon'
  import { onMount, untrack } from 'svelte'

  let {
    startDateISO = null,
    willOpen = false,
    ondateselected = () => {}
  } = $props();

  // State
  let selected = $state(null)
  let month = $state(DateTime.now().startOf('month'))
  let popover = $state(null)
  let inputButton = $state(null)

  let selectedMonth = $derived(month.month)
  let selectedYear = $derived(month.year)

  // Initialize from startDateISO
  $effect(() => {
    if (startDateISO) {
      // Capture dependency
      const iso = startDateISO;
      
      untrack(() => {
        try {
          const parsed = DateTime.fromISO(iso)
          // Update selected if it's different
          if (!selected || !parsed.hasSame(selected, 'day')) {
            selected = parsed
            // Sync month to selected date
            const newMonth = selected.startOf('month')
            if (!month.hasSame(newMonth, 'month')) {
              month = newMonth
            }
          }
        } catch {
          selected = null
        }
      })
    }
  })

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
  let display = $derived(selected ? selected.toFormat('MMM d') : '')
  
  // Month name for header
  let monthName = $derived(month.toFormat('MMMM'))

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
      selected = null
      ondateselected({ mmdd: '', yyyy: '' })
      if (popover) popover.hidePopover()
    } else {
      selected = day.date
      ondateselected({ mmdd: day.date.toFormat('MM/dd'), yyyy: day.date.year })
      if (popover) popover.hidePopover()
    }
  }

  function prevMonth() {
    month = month.minus({ months: 1 })
  }

  function nextMonth() {
    month = month.plus({ months: 1 })
  }

  function handleYearInput(e) {
    const val = parseInt(e.target.value)
    // Allow typing (handle partials) but only update if reasonable
    if (!isNaN(val) && val >= 1 && val <= 9999) {
      month = month.set({ year: val })
    }
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
      <div class="title-group">
        <span class="month-label">{monthName}</span>
        <input 
          type="number" 
          class="year-input" 
          value={selectedYear} 
          oninput={handleYearInput}
          placeholder="YYYY"
        />
      </div>
      
      <div class="nav-group">
        <button type="button" class="nav-btn" onclick={prevMonth} aria-label="Previous month">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button type="button" class="nav-btn" onclick={nextMonth} aria-label="Next month">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
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
    justify-content: space-between;
    margin-bottom: calc(var(--spacing) * 1.5);
    padding: calc(var(--spacing) * 0.5) calc(var(--spacing) * 0.75);
  }

  .title-group {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }

  .nav-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .month-label {
    font-weight: 700;
    font-size: clamp(22px, 5.5vw, 28px);
    color: var(--text-primary, #000);
    line-height: 1.2;
  }
  
  .year-input {
    width: 5ch;
    font-family: inherit;
    font-size: clamp(20px, 5vw, 26px);
    font-weight: 400;
    color: var(--text-secondary, #666);
    background: transparent;
    border: none;
    border-bottom: 1px dashed var(--text-secondary, #999);
    padding: 0;
    padding-bottom: 2px;
    margin: 0;
    border-radius: 0;
    transition: all 0.2s;
    line-height: 1.2;
    -moz-appearance: textfield;
    appearance: textfield;
  }
  
  .year-input:hover {
    color: var(--text-primary, #000);
    border-bottom-color: var(--text-primary, #000);
    background: transparent;
  }
  
  .year-input:focus {
    color: var(--text-primary, #000);
    border-bottom-color: var(--primary-color, #007aff);
    border-bottom-style: solid;
    background: transparent;
    outline: none;
  }

  .year-input::-webkit-outer-spin-button,
  .year-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-secondary, #666);
    cursor: pointer;
    padding: 0;
    width: var(--touch-target);
    height: var(--touch-target);
    border-radius: 50%;
    transition: background-color 0.2s;
  }
  
  .nav-btn:hover {
    background-color: var(--hover-bg, #f0f0f0);
    color: var(--text-primary, #000);
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
