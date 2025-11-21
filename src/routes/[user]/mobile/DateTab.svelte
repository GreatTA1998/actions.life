<script>
  import { user } from '$lib/store'
  import { DateTime } from 'luxon'
  import { collection, query, where, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { openTaskPopup, updateCache } from '$lib/store/index.js'
  import { onMount, onDestroy, tick, getContext } from 'svelte'
  import DatePicker from '$lib/components/DatePicker.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'

  let selectedDate = $state(DateTime.now().startOf('day'))
  let loadedDays = $state([]) 
  let loading = $state(false)
  let unsubs = [] 
  let scrollContainer = $state(null)
  let showDateLabels = $state(true) // Toggle to show/hide textual date headers

  const CHUNK_SIZE = 14 
  const SCROLL_THRESHOLD = 500 

  onMount(() => {
    resetAndLoadFrom(selectedDate)
  })

  onDestroy(() => {
    cleanupListeners()
  })

  function cleanupListeners() {
    unsubs.forEach(u => u())
    unsubs = []
  }

  // --- Core Logic ---
  async function resetAndLoadFrom(anchorDate) {
    cleanupListeners()
    loading = true
    loadedDays = [] 
    
    addDayChunk(anchorDate, CHUNK_SIZE)
    
    await tick()
    if (scrollContainer) {
      scrollContainer.scrollTop = 0
    }
    
    loading = false
  }

  function loadMore() {
    if (loading || loadedDays.length === 0) return
    
    const lastDay = loadedDays[loadedDays.length - 1].date
    const nextStart = lastDay.plus({ days: 1 })
    
    addDayChunk(nextStart, CHUNK_SIZE)
  }

  function addDayChunk(startDate, count) {
    const newDays = []
    for (let i = 0; i < count; i++) {
      const date = startDate.plus({ days: i })
      newDays.push({
        date,
        dateISO: date.toISODate(),
        tasks: [] 
      })
    }
    
    loadedDays = [...loadedDays, ...newDays]

    const startISO = startDate.toISODate()
    const endISO = startDate.plus({ days: count - 1 }).toISODate()
    
    try {
      const ref = collection(db, '/users/' + $user.uid + '/tasks')
      const q = query(
        ref,
        where('startDateISO', '>=', startISO),
        where('startDateISO', '<=', endISO)
      )

      const unsub = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        updateCache(tasks)
        distributeTasks(tasks, startISO, endISO)
      }, (error) => {
        console.error("Error listening to tasks:", error)
      })
      
      unsubs.push(unsub)
    } catch (err) {
      console.error("Error setting up listener:", err)
    }
  }

  function distributeTasks(fetchedTasks, startRangeISO, endRangeISO) {
    const taskMap = {}
    fetchedTasks.forEach(t => {
      if (!taskMap[t.startDateISO]) taskMap[t.startDateISO] = []
      taskMap[t.startDateISO].push(t)
    })

    loadedDays = loadedDays.map(day => {
      if (day.dateISO >= startRangeISO && day.dateISO <= endRangeISO) {
        let dayTasks = taskMap[day.dateISO] || []
        dayTasks.sort((a, b) => {
           if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime)
           if (a.startTime && !b.startTime) return -1
           if (!a.startTime && b.startTime) return 1
           return 0
        })
        return { ...day, tasks: dayTasks }
      }
      return day
    })
  }

  // --- Interaction Handlers ---
  function handleDateSelected({ mmdd, yyyy }) {
    if (!mmdd || !yyyy) return

    const [month, day] = mmdd.split('/').map(Number)
    const year = Number(yyyy)
    const newDate = DateTime.fromObject({ year, month, day }).startOf('day')
    
    selectedDate = newDate

    const existingIndex = loadedDays.findIndex(d => d.date.hasSame(newDate, 'day'))

    if (existingIndex !== -1) {
      const el = document.getElementById(`day-${newDate.toISODate()}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      resetAndLoadFrom(newDate)
    }
  }

  function handleScroll(e) {
    const container = e.target
    const distToBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    if (distToBottom < SCROLL_THRESHOLD) {
      loadMore()
    }

    // Continuous update logic (no debounce)
    if (!container) return
    
    const daySections = container.querySelectorAll('.day-section')
    const containerRect = container.getBoundingClientRect()
    // Reduced offset to capture even small empty days at the top
    const offset = 10 

    for (const section of daySections) {
      const rect = section.getBoundingClientRect()
      // Find the first section that is effectively "at the top" or just below it
      // We check if the bottom is below the top trigger point.
      if (rect.bottom > containerRect.top + offset) {
        const iso = section.id.replace('day-', '')
        if (iso && (!selectedDate || selectedDate.toISODate() !== iso)) {
          selectedDate = DateTime.fromISO(iso)
        }
        break
      }
    }
  }
  
  // --- Helpers ---
  function isRoutine(task) {
    // User definition: "routine instances... can be an icon"
    // We include tasks with icons OR templateIDs as "routines" to be docked
    return !!(task.templateID || task.iconURL)
  }

  function getRoutineTasks(tasks) {
    return tasks.filter(isRoutine)
  }

  function getRegularTasks(tasks) {
    return tasks.filter(t => !isRoutine(t))
  }

  function formatTime(isoTime) {
    return DateTime.fromFormat(isoTime, 'HH:mm').toFormat('h:mm a')
  }
</script>

<div class="date-view">
  <div class="calendar-container">
    <DatePicker
      selected={selectedDate}
      inline={true}
      ondateselected={handleDateSelected}
    />
  </div>

  <div 
    class="tasks-list" 
    onscroll={handleScroll} 
    bind:this={scrollContainer}
  >
    {#if loadedDays.length === 0 && loading}
       <div class="loading">Loading schedule...</div>
    {:else}
       {#each loadedDays as day, i (day.dateISO)}
         <div class="day-section" id="day-{day.dateISO}">
           <div class="day-anchor" data-iso={day.dateISO}></div>
           
            {#if i > 0}
              <div class="day-divider" class:is-empty={day.tasks.length === 0}></div>
            {/if}

            {#if day.tasks.length > 0 && showDateLabels}
              <div class="day-divider-text" class:is-selected={selectedDate && selectedDate.hasSame(day.date, 'day')}
                style="padding: 16px;"
              >
                <span class="dd-day">{day.date.toFormat('cccc')}</span>
                <span class="dd-date">{day.date.toFormat('MMM d')}</span>
              </div>
            {/if}


           {#if day.tasks.length > 0}
           <div class="day-content">
             <!-- Horizontal Routine Dock -->
             {#if getRoutineTasks(day.tasks).length > 0}
               <div class="routine-dock">
                 {#each getRoutineTasks(day.tasks) as task (task.id)}
                   {#if task.iconURL}
                      <DoodleIcon iconTask={task} size={40} />
                   {:else}
                      <button 
                        class="routine-pill" 
                        class:is-done={task.isDone}
                        onclick={() => openTaskPopup(task)}
                      >
                        {task.name}
                      </button>
                   {/if}
                 {/each}
               </div>
             {/if}

             <!-- Regular Task List -->
             <div class="event-list">
               {#each getRegularTasks(day.tasks) as task (task.id)}
                  <button 
                    class="event-row" 
                    class:is-done={task.isDone}
                    class:has-time={!!task.startTime}
                    onclick={() => openTaskPopup(task)}
                  >
                    {#if task.startTime}
                      <div class="event-time">
                        {formatTime(task.startTime)}
                      </div>
                    {/if}
                    
                    <div class="event-details">
                      <div class="event-name">{task.name}</div>
                      {#if task.notes}
                        <div class="event-notes">{task.notes}</div>
                      {/if}
                    </div>
                  </button>
               {/each}
             </div>
           </div>
           {/if}
         </div>
       {/each}
       
       <div class="scroll-loader">
          <div class="loader-dots">...</div>
       </div>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    --accent-color: #007aff;
  }

  .date-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .calendar-container {
    flex-shrink: 0;
    background: white;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 4px;
  }

  .tasks-list {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 80px;
    scroll-behavior: smooth; 
  }

  .day-section {
    position: relative;
  }
  
  .day-anchor {
    position: absolute;
    top: -100px;
    height: 1px; 
    width: 1px;
  }

  .day-divider {
    border-top: 1px dashed #dadada;
    margin-top: 0;
  }

  .day-divider.is-empty {
    padding: 2px 12px;
  }

  .day-divider-text {
    font-size: var(--font-size-md);
    color: #888;
    font-weight: 600;
    transition: color 0.2s;
  }
  
  .day-divider-text.is-selected {
    color: var(--primary-color, #007aff);
  }

  .dd-day {
    text-transform: uppercase;
    margin-right: 6px;
  }

  .day-content {
    padding: 0 0 16px 0;
  }

  /* Routine Dock */
  .routine-dock {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 16px;
    align-items: center;
  }

  .routine-pill {
    background: #f5f5f5;
    border: none;
    border-radius: 16px;
    padding: 6px 12px;
    font-size: var(--font-size-sm);
    color: #555;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .routine-pill.is-done {
    background: #e0e0e0;
    color: #999;
    text-decoration: line-through;
  }

  /* Event List */
  .event-list {
    display: flex;
    flex-direction: column;
  }

  .event-row {
    display: flex;
    align-items: flex-start;
    width: 100%;
    background: transparent;
    border: none;
    padding: 10px 16px;
    text-align: left;
    cursor: pointer;
    border-bottom: 1px solid #fcfcfc;
    transition: background 0.1s;
  }

  .event-row:active {
    background: #f9f9f9;
  }
  
  .event-row.is-done .event-name {
    text-decoration: none;
    color: #1e8e24;
  }
  
  .event-row.is-done {
    background: linear-gradient(to right, rgba(76, 175, 80, 0.04), transparent);
  }

  .event-row.is-done .event-time {
    color: #4caf50;
    opacity: 0.7;
  }

  .event-time {
    margin-right: 12px;
    flex-shrink: 0;
    font-size: var(--font-size-sm);
    color: #888;
    font-weight: 500;
    padding-top: 2px;
    min-width: 60px; /* Only take space if time exists */
    text-align: right;
  }

  /* Remove padding/gap for untimed tasks to align left */
  .event-row:not(.has-time) {
    padding-left: 16px;
  }
  
  .event-details {
    flex: 1;
    min-width: 0;
  }

  .event-name {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: #222;
    line-height: 1.4;
  }

  .event-notes {
    font-size: var(--font-size-sm);
    color: #999;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .loading, .scroll-loader, .empty-day-msg {
    text-align: center;
    padding: 20px;
    color: #ccc;
    font-size: var(--font-size-sm);
  }
  
  .loader-dots {
    font-size: var(--font-size-xl);
    letter-spacing: 2px;
  }
</style>
