<script>
  import { user } from '$lib/store'
  import { DateTime } from 'luxon'
  import { collection, query, where, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { openTaskPopup, updateCache } from '$lib/store/index.js'
  import { onMount, onDestroy, tick } from 'svelte'
  import DatePicker from '$lib/components/DatePicker.svelte'

  // --- State ---
  let selectedDate = $state(DateTime.now().startOf('day'))
  // loadedDays: Array of objects { date: DateTime, dateISO: string, tasks: Task[] }
  let loadedDays = $state([]) 
  let visibleDays = $derived(loadedDays.filter(d => d.tasks.length > 0))
  let loading = $state(false)
  let unsubs = [] 
  let scrollContainer = $state(null)
  let scrollTimeout

  // --- Constants ---
  const CHUNK_SIZE = 14 // Load 2 weeks at a time
  const SCROLL_THRESHOLD = 500 // Pixels from bottom to trigger load

  // --- Lifecycle ---
  onMount(() => {
    resetAndLoadFrom(selectedDate)
  })

  onDestroy(() => {
    cleanupListeners()
    if (scrollTimeout) clearTimeout(scrollTimeout)
  })

  function cleanupListeners() {
    unsubs.forEach(u => u())
    unsubs = []
  }

  // --- Core Logic ---

  // 1. Reset & Load (Teleport)
  async function resetAndLoadFrom(anchorDate) {
    cleanupListeners()
    loading = true
    loadedDays = [] // Clear current view
    
    // Generate the initial chunk of days
    addDayChunk(anchorDate, CHUNK_SIZE)
    
    // Reset scroll position
    await tick()
    if (scrollContainer) {
      scrollContainer.scrollTop = 0
    }
    
    loading = false
  }

  // 2. Load More (Infinite Scroll)
  function loadMore() {
    if (loading || loadedDays.length === 0) return
    
    const lastDay = loadedDays[loadedDays.length - 1].date
    const nextStart = lastDay.plus({ days: 1 })
    
    addDayChunk(nextStart, CHUNK_SIZE)
  }

  // Helper: Add a chunk of empty days and attach a listener for them
  function addDayChunk(startDate, count) {
    const newDays = []
    for (let i = 0; i < count; i++) {
      const date = startDate.plus({ days: i })
      newDays.push({
        date,
        dateISO: date.toISODate(),
        tasks: [] // Will be populated by listener
      })
    }
    
    // Append to state
    loadedDays = [...loadedDays, ...newDays]

    // Setup Firestore listener for this range
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
        
        // Update global cache if needed
        updateCache(tasks)
        
        // Distribute tasks to the correct days in our local state
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
    // Create a map for easier lookup
    const taskMap = {}
    fetchedTasks.forEach(t => {
      if (!taskMap[t.startDateISO]) taskMap[t.startDateISO] = []
      taskMap[t.startDateISO].push(t)
    })

    // We only want to update the days within the range of this listener
    // to avoid re-rendering the whole list if not needed, 
    // though Svelte 5 fine-grained reactivity handles this well.
    loadedDays = loadedDays.map(day => {
      // Only update if this day is within the range we just fetched for
      // (Optimization: actually we can just update all matching ISOs since map lookup is fast)
      if (day.dateISO >= startRangeISO && day.dateISO <= endRangeISO) {
        let dayTasks = taskMap[day.dateISO] || []
        // Sort by time
        dayTasks.sort((a, b) => {
           if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime)
           return 0
        })
        return { ...day, tasks: dayTasks }
      }
      return day
    })
  }

  // --- Interaction Handlers ---

  // Handle date selection from the calendar component
  function handleDateSelected({ mmdd, yyyy }) {
    if (!mmdd || !yyyy) return

    const [month, day] = mmdd.split('/').map(Number)
    const year = Number(yyyy)
    const newDate = DateTime.fromObject({ year, month, day }).startOf('day')
    
    // Update selection state immediately
    selectedDate = newDate

    // Check if this date is already rendered in our list
    const existingIndex = loadedDays.findIndex(d => d.date.hasSame(newDate, 'day'))

    if (existingIndex !== -1) {
      // Case A: Date is loaded -> Scroll to it
      const el = document.getElementById(`day-${newDate.toISODate()}`)
      if (el) {
        // Temporarily disable scroll listener updates to avoid fighting
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      // Case B: Date is far away -> Teleport (Reset view)
      resetAndLoadFrom(newDate)
    }
  }

  // Handle scroll to update selected date (Intersection Observer alternative)
  function handleScroll(e) {
    const container = e.target

    // 1. Infinite Scroll Trigger
    const distToBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    if (distToBottom < SCROLL_THRESHOLD) {
      loadMore()
    }

    // 2. Update Calendar Selection based on visible day
    // Debounce slightly to avoid thrashing updates
    if (scrollTimeout) clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      if (!container) return
      
      const dayHeaders = container.querySelectorAll('.day-section')
      const containerRect = container.getBoundingClientRect()
      const offset = 80 // look a bit down from the top

      for (const section of dayHeaders) {
        const rect = section.getBoundingClientRect()
        // The first section that has its bottom below our offset line is the "current" one
        if (rect.bottom > containerRect.top + offset) {
          const iso = section.dataset.iso
          if (iso && (!selectedDate || selectedDate.toISODate() !== iso)) {
            // Update selectedDate without triggering a reload (one-way sync here)
            selectedDate = DateTime.fromISO(iso)
          }
          break
        }
      }
    }, 50)
  }
</script>

<div class="date-view">
  <!-- Calendar Header -->
  <div class="calendar-container">
    <DatePicker
      selected={selectedDate}
      inline={true}
      ondateselected={handleDateSelected}
    />
  </div>

  <!-- Scrollable Schedule List -->
  <div 
    class="tasks-list" 
    onscroll={handleScroll} 
    bind:this={scrollContainer}
  >
    {#if visibleDays.length === 0 && loading}
       <div class="loading">Loading schedule...</div>
    {:else}
       {#each visibleDays as day, index (day.dateISO)}
         <div class="day-section" id="day-{day.dateISO}" data-iso={day.dateISO}>
           
           <!-- Sticky Date Header -->
           <!-- Hide for the very first visible day (anchored by calendar) -->
           {#if index > 0}
             <div class="day-header" class:is-today={day.date.hasSame(DateTime.now(), 'day')}>
               <div class="day-header-content">
                 <span class="day-name">{day.date.toFormat('cccc')}</span>
                 <span class="day-number">{day.date.toFormat('MMM d')}</span>
               </div>
             </div>
           {/if}

           <!-- Tasks -->
           <div class="day-tasks">
             {#each day.tasks as task (task.id)}
                  <div 
                    class="task-item" 
                    onclick={() => openTaskPopup(task)}
                    onkeydown={(e) => e.key === 'Enter' && openTaskPopup(task)}
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
             </div>
           </div>
       {/each}
       
       <!-- Loading Indicator at bottom -->
       <div class="scroll-loader">
          <div class="loader-dots">...</div>
       </div>
    {/if}
  </div>
</div>

<style>
  .date-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f9f9f9;
  }

  .calendar-container {
    flex-shrink: 0;
    background: white;
    z-index: 20;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    padding-bottom: 8px;
  }

  .tasks-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 16px;
    scroll-behavior: smooth; /* Adds smooth scrolling natively */
  }

  .day-section {
    margin-bottom: 24px;
    scroll-margin-top: 60px; /* Prevents header from obscuring content when scrolling to it */
  }

  .day-header {
    position: sticky;
    top: 0;
    z-index: 10;
    margin-bottom: 12px;
    pointer-events: none; /* Let clicks pass through to items behind if any */
  }

  .day-header-content {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    background: rgba(249, 249, 249, 0.9);
    backdrop-filter: blur(8px);
    padding: 8px 12px;
    border-radius: 20px;
    color: #555;
    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  }

  .day-header.is-today .day-header-content {
    color: #007aff;
    background: rgba(0, 122, 255, 0.1);
  }

  .day-name {
    text-transform: uppercase;
    font-size: 13px;
    font-weight: 600;
    opacity: 0.7;
  }

  .day-number {
    font-size: 16px;
    font-weight: 700;
  }

  .day-tasks {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-left: 4px; /* Indent slightly */
  }

  .task-item {
    background: white;
    border: 1px solid transparent;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    display: flex;
    gap: 12px;
    transition: all 0.2s ease;
  }

  .task-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .task-item:active {
    transform: scale(0.99);
  }

  .task-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0;
    background: #eee;
  }

  .task-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .task-name {
    font-weight: 600;
    font-size: 15px;
    color: #333;
    line-height: 1.3;
  }

  .task-time {
    font-size: 13px;
    color: #007aff;
    font-weight: 500;
    margin-top: 2px;
  }

  .task-notes {
    font-size: 13px;
    color: #888;
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .loading, .scroll-loader {
    text-align: center;
    padding: 40px;
    color: #999;
    font-size: 14px;
    width: 100%;
  }

  .loader-dots {
    font-weight: bold;
    letter-spacing: 4px;
    font-size: 24px;
    opacity: 0.3;
  }
</style>
