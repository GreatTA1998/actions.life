<script>
  import { user } from '$lib/store'
  import { DateTime } from 'luxon'
  import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { openTaskPopup, updateCache } from '$lib/store/index.js'
  import { onMount, onDestroy } from 'svelte'

  // Calendar state
  let viewingMonth = DateTime.now().startOf('month')
  let selectedDate = DateTime.now().startOf('day')
  let selectedTasks = []
  let allMonthTasks = [] // Tasks for the entire month to show indicators
  let loadingTasks = false
  let unsub

  // Month/Year picker state
  let showMonthPicker = false
  let showYearPicker = false
  let monthYearButtonRef

  // Filter tasks by selected date
  let selectedDateISO = selectedDate.toISODate()

  $: if (selectedDateISO) {
    loadTasksForDate()
  }

  $: if (viewingMonth) {
    loadTasksForMonth()
  }

  $: calendarDays = getCalendarDays(viewingMonth)

  onMount(async () => {
    loadTasksForDate()
    loadTasksForMonth()
  })

  onDestroy(() => {
    if (unsub) unsub()
  })

  function getCalendarDays(month) {
    const firstDay = month.startOf('month')
    const lastDay = month.endOf('month')
    const startOfCalendar = firstDay.startOf('week') // Start from Sunday
    const endOfCalendar = lastDay.endOf('week') // End on Saturday
    
    const days = []
    let current = startOfCalendar
    
    while (current <= endOfCalendar) {
      days.push({
        date: current,
        isCurrentMonth: current.month === month.month && current.year === month.year,
        isToday: current.hasSame(DateTime.now(), 'day'),
        isSelected: current.hasSame(selectedDate, 'day')
      })
      current = current.plus({ days: 1 })
    }
    
    return days
  }

  function getTasksForDate(dateISO) {
    return allMonthTasks.filter(task => task.startDateISO === dateISO)
  }

  function hasTasksForDate(dateISO) {
    return allMonthTasks.some(task => task.startDateISO === dateISO)
  }

  async function loadTasksForDate() {
    loadingTasks = true
    try {
      const ref = collection(db, '/users/' + $user.uid + '/tasks')
      const q = query(
        ref,
        where('startDateISO', '==', selectedDateISO)
      )
      
      if (unsub) unsub()
      unsub = onSnapshot(q, (querySnapshot) => {
        const tasks = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        // Sort by time if available
        tasks.sort((a, b) => {
          if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime)
          }
          return 0
        })
        updateCache(tasks)
        selectedTasks = tasks
        loadingTasks = false
      })
    } catch (error) {
      console.error('Error loading tasks:', error)
      loadingTasks = false
    }
  }

  async function loadTasksForMonth() {
    const startDateISO = viewingMonth.startOf('month').toISODate()
    const endDateISO = viewingMonth.endOf('month').toISODate()
    
    try {
      const ref = collection(db, '/users/' + $user.uid + '/tasks')
      const q = query(
        ref,
        where('startDateISO', '>=', startDateISO),
        where('startDateISO', '<=', endDateISO)
      )
      
      const snapshot = await getDocs(q)
      allMonthTasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    } catch (error) {
      console.error('Error loading month tasks:', error)
    }
  }

  function selectDate(date) {
    selectedDate = date.startOf('day')
    selectedDateISO = selectedDate.toISODate()
  }

  function goToPreviousMonth() {
    viewingMonth = viewingMonth.minus({ months: 1 }).startOf('month')
  }

  function goToNextMonth() {
    viewingMonth = viewingMonth.plus({ months: 1 }).startOf('month')
  }

  function goToToday() {
    viewingMonth = DateTime.now().startOf('month')
    selectDate(DateTime.now())
  }

  function selectMonth(monthIndex) {
    viewingMonth = viewingMonth.set({ month: monthIndex })
    showMonthPicker = false
    // Select first day of the month if current selection is out of range
    if (selectedDate.month !== monthIndex || selectedDate.year !== viewingMonth.year) {
      selectDate(viewingMonth.startOf('month'))
    }
  }

  function selectYear(year) {
    viewingMonth = viewingMonth.set({ year })
    showYearPicker = false
    // Select first day of the month if current selection is out of range
    if (selectedDate.year !== year) {
      selectDate(viewingMonth.startOf('month'))
    }
  }

  function toggleMonthPicker() {
    showMonthPicker = !showMonthPicker
    showYearPicker = false
  }

  function toggleYearPicker() {
    showYearPicker = !showYearPicker
    showMonthPicker = false
  }

  function handleClickOutside(event) {
    if (monthYearButtonRef && !monthYearButtonRef.contains(event.target)) {
      showMonthPicker = false
      showYearPicker = false
    }
  }

  function stopPropagation(event) {
    event.stopPropagation()
  }

  $: monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December']
  
  $: currentYear = viewingMonth.year
  $: currentMonth = viewingMonth.month
  
  $: years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)
</script>

<div class="date-view" on:click={handleClickOutside}>
  <div class="calendar-header" bind:this={monthYearButtonRef}>
    <div class="month-year">
      <button class="month-button" on:click={(e) => { e.stopPropagation(); toggleMonthPicker(); }}>
        {viewingMonth.toFormat('MMMM')}
      </button>
      <button class="year-button" on:click={(e) => { e.stopPropagation(); toggleYearPicker(); }}>
        {viewingMonth.toFormat('yyyy')}
      </button>
    </div>
    
    {#if showMonthPicker}
      <div class="picker-popover month-picker" on:click={stopPropagation}>
        {#each monthNames as monthName, index}
          <button
            class="picker-item"
            class:active={index + 1 === currentMonth}
            on:click={() => selectMonth(index + 1)}
          >
            {monthName}
          </button>
        {/each}
      </div>
    {/if}
    
    {#if showYearPicker}
      <div class="picker-popover year-picker" on:click={stopPropagation}>
        {#each years as year}
          <button
            class="picker-item"
            class:active={year === currentYear}
            on:click={() => selectYear(year)}
          >
            {year}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <div class="calendar-grid">
    <div class="day-header">
      {#each ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as day}
        <div class="day-header-cell">{day}</div>
      {/each}
    </div>
    <div class="calendar-days">
      {#each calendarDays as day (day.date.toISODate())}
        <button
          class="day-cell"
          class:other-month={!day.isCurrentMonth}
          class:today={day.isToday}
          class:selected={day.isSelected}
          on:click={() => day.isCurrentMonth && selectDate(day.date)}
          disabled={!day.isCurrentMonth}
        >
          <span class="day-number">{day.date.day}</span>
          {#if day.isCurrentMonth && hasTasksForDate(day.date.toISODate())}
            {@const taskCount = getTasksForDate(day.date.toISODate()).length}
            {#if taskCount > 0}
              <div class="task-indicators">
                {#each Array(Math.min(taskCount, 3)) as _}
                  <div class="task-dot"></div>
                {/each}
              </div>
            {/if}
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <div class="tasks-list">
    {#if loadingTasks}
      <div class="loading">Loading tasks...</div>
    {:else if selectedTasks && selectedTasks.length > 0}
      {#each selectedTasks as task (task.id)}
        <div 
          class="task-item" 
          on:click={() => openTaskPopup(task)}
          on:keydown={(e) => e.key === 'Enter' && openTaskPopup(task)}
          tabindex="0"
          role="button"
        >
          {#if task.imageDownloadURL}
            <img src={task.imageDownloadURL} alt={task.name} class="task-image" />
          {/if}
          <div class="task-info">
            <div class="task-name">{task.name}</div>
            {#if task.startTime}
              <div class="task-time">
                {DateTime.fromISO(`${task.startDateISO}T${task.startTime}`).toFormat('h:mm a')}
              </div>
            {/if}
            {#if task.notes}
              <div class="task-notes">{task.notes}</div>
            {/if}
          </div>
        </div>
      {/each}
    {:else}
      <div class="no-tasks">No tasks found for this date</div>
    {/if}
  </div>
</div>

<style>
  .date-view {
    height: 100%;
  }

  .calendar-header {
    position: relative;
    margin-bottom: 16px;
    padding: 6px 0;
  }

  .month-year {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .month-button {
    border: none;
    background: transparent;
    font-size: 32px;
    font-weight: 600;
    color: #1a1a1a;
    cursor: pointer;
    padding: 0;
    border-radius: 0;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
    line-height: 1.1;
    letter-spacing: -0.8px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    position: relative;
  }

  .month-button::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--location-indicator-color, #00597d);
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .month-button:hover {
    opacity: 0.7;
    transform: translateY(-1px);
  }

  .month-button:hover::after {
    width: 100%;
  }

  .year-button {
    border: none;
    background: transparent;
    font-size: 32px;
    font-weight: 600;
    color: #1a1a1a;
    cursor: pointer;
    padding: 0;
    border-radius: 0;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
    line-height: 1.1;
    letter-spacing: -0.8px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    position: relative;
  }

  .year-button::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--location-indicator-color, #00597d);
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .year-button:hover {
    opacity: 0.7;
    transform: translateY(-1px);
  }

  .year-button:hover::after {
    width: 100%;
  }

  .picker-popover {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    max-height: 300px;
    overflow-y: auto;
    padding: 4px;
  }

  .month-picker {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    min-width: 200px;
  }

  .year-picker {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    min-width: 180px;
    max-height: 200px;
  }

  .picker-item {
    border: none;
    background: transparent;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    text-align: center;
    transition: all 0.15s;
  }

  .picker-item:hover {
    background: #f5f5f5;
  }

  .picker-item.active {
    background: var(--location-indicator-color, #00597d);
    color: white;
    font-weight: 600;
  }

  .calendar-grid {
    margin-bottom: 12px;
  }

  .day-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0;
    margin-bottom: 2px;
  }

  .day-header-cell {
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: #999;
    padding: 2px 0;
  }

  .calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0;
  }

  .day-cell {
    aspect-ratio: 1;
    border: none;
    border-radius: 0;
    background: transparent;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: all 0.15s;
    position: relative;
    min-height: 32px;
  }

  .day-cell.other-month {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Today indicator - Linear/Notion style: small dot at top */
  .day-cell.today:not(.selected)::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--location-indicator-color, #00597d);
  }
  
  /* When today is selected, show dot above the ring */
  .day-cell.today.selected::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--location-indicator-color, #00597d);
    z-index: 1;
  }

  /* Selected state - Linear/Notion style: subtle ring and background */
  .day-cell.selected {
    background: rgba(0, 89, 125, 0.08);
    position: relative;
  }

  .day-cell.selected::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 1.5px solid var(--location-indicator-color, #00597d);
    border-radius: 4px;
    pointer-events: none;
  }

  .day-cell.selected .day-number {
    color: var(--location-indicator-color, #00597d);
    font-weight: 600;
  }

  .day-cell:not(.selected):not(.other-month):hover {
    background: #f5f5f5;
  }

  .day-number {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    line-height: 1.1;
  }

  .task-indicators {
    display: flex;
    gap: 1.5px;
    justify-content: center;
    align-items: center;
    margin-top: 0;
    height: 3px;
  }

  .task-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #999;
    flex-shrink: 0;
  }

  .day-cell.selected .task-dot {
    background: var(--location-indicator-color, #00597d);
    opacity: 0.6;
  }

  .tasks-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .task-item {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    gap: 12px;
  }

  .task-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .task-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .task-info {
    flex: 1;
    min-width: 0;
  }

  .task-name {
    font-weight: 500;
    font-size: 15px;
    margin-bottom: 4px;
    color: #333;
  }

  .task-time {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
  }

  .task-notes {
    font-size: 13px;
    color: #888;
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .loading, .no-tasks {
    text-align: center;
    padding: 40px 20px;
  }
</style>

