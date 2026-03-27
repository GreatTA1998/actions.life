<script>
  import { user } from '$lib/store'
  import { DateTime } from 'luxon'
  import { collection, query, where, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { openTaskPopup, updateCache } from '$lib/store/index.js'
  import { onMount, onDestroy, tick, getContext } from 'svelte'
  import DatePicker from '$lib/components/DatePicker.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import SimpleToggle from '$lib/components/SimpleToggle.svelte'
  import { WIDTHS } from '$lib/utils/constants.js'

  const { User } = getContext('app')

  let selectedDate = $state(DateTime.now().startOf('day'))
  let loadedDays = $state([]) 
  let loading = $state(false)
  let unsubs = [] 
  let scrollContainer = $state(null)

  const CHUNK_SIZE = 14 
  const SCROLL_THRESHOLD = 500 

  onMount(() => {
    resetAndLoadFrom(selectedDate)
  })

  onDestroy(() => {
    cleanupListeners()
  })

  function onVisibilityChange ({ year, month }) {
    let newDate = selectedDate.set({ month })
    helper(newDate.set({ year }))
  }

  function onChange (yyyyMMdd) {
    if (!yyyyMMdd) return
    helper(DateTime.fromISO(yyyyMMdd))
  }

  function helper (newDate) {
    selectedDate = newDate
    const existingIndex = loadedDays.findIndex(d => d.date.hasSame(newDate, 'day'))
    if (existingIndex !== -1) {
      const el = document.getElementById(`day-${newDate.toISODate()}`)
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' })
      }
    } else {
      resetAndLoadFrom(newDate)
    }
  }

  function cleanupListeners() {
    unsubs.forEach(u => u())
    unsubs = []
  }

  async function resetAndLoadFrom (anchorDate) {
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

  function loadMore () {
    if (loading || loadedDays.length === 0) return
    
    const lastDay = loadedDays[loadedDays.length - 1].date
    const nextStart = lastDay.plus({ days: 1 })
    
    addDayChunk(nextStart, CHUNK_SIZE)
  }

  function addDayChunk (startDate, count) {
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

  function distributeTasks (fetchedTasks, startRangeISO, endRangeISO) {
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

  function onscroll (e) {
    const container = e.target
    const distToBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    if (distToBottom < SCROLL_THRESHOLD) {
      loadMore()
    }

    if (!container) return
    
    const daySections = container.querySelectorAll('.day-section')
    const containerRect = container.getBoundingClientRect()

    const offset = 10 // Reduced offset to capture even small empty days at the top 

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
  
  function isRoutine (task) {
    return !!(task.templateID || task.iconURL)
  }

  function getRoutineTasks (tasks) {
    return tasks.filter(isRoutine)
  }

  function getRegularTasks (tasks) {
    return tasks.filter(t => !isRoutine(t))
  }

  function formatTime (isoTime) {
    return DateTime.fromFormat(isoTime, 'HH:mm').toFormat('h:mm a')
  }
</script>

<div class="h-full basis-full flex justify-center">
  <div class="basis-full flex flex-col bg-white" style:max-width={WIDTHS.PANEL_MAX + 'px'}>
    <div class="shrink-0">
      <DatePicker valueDT={selectedDate}
        {onVisibilityChange}
        {onChange}
      />
    </div>

    <div class="py-2 px-4 border-y-solid border-gray-100">
      <SimpleToggle 
        checked={$user.hideRoutines} 
        onchange={e => User.update({ hideRoutines: e.target.checked })} 
        label="Exclude routines" 
      />
    </div>

    <div {onscroll} bind:this={scrollContainer}
      style:flex="1"
      class="overflow-y-auto scroll-smooth pb-[80px]" 
    >
      {#each loadedDays as day, i (day.dateISO)}
        {@const filteredTasks = $user.hideRoutines ? day.tasks.filter(t => !t.templateID) : day.tasks}
        <div class="day-section" id="day-{day.dateISO}">
          {#if filteredTasks.length > 0}
            <div class="day-title p-4" class:highlight={selectedDate.hasSame(day.date, 'day')}>
              <span class="uppercase mr-1">{day.date.toFormat('cccc')}</span>
              <span>{day.date.toFormat('MMM d')}</span>
            </div>
          {/if}

          {#if filteredTasks.length > 0}
            <div class="pb-4">
              {#if getRoutineTasks(filteredTasks).length > 0}
                <div class="flex items-center flex-wrap gap-3 py-3 px-4">
                  {#each getRoutineTasks(filteredTasks) as task (task.id)}
                    {#if task.iconURL}
                      <DoodleIcon iconTask={task} size={40} />
                    {:else}
                      <button onclick={() => openTaskPopup(task)}
                        class="routine-pill" 
                        style:color={task.isDone ? '#1e8e24' : ''}
                      >
                        {task.name}
                      </button>
                    {/if}
                  {/each}
                </div>
              {/if}

              <div class="flex flex-col">
                {#each getRegularTasks(filteredTasks) as task (task.id)}
                  <button onclick={() => openTaskPopup(task)}
                    class="gap-x-4 text-left py-2 px-4" 
                    class:done-gradient={task.isDone}
                  >
                    {#if task.startTime}
                      <div class="shrink-0 event-time">
                        {formatTime(task.startTime)}
                      </div>
                    {/if}
                    
                    <div class="min-w-0">
                      <div class="event-name">{task.name}</div>
                      {#if task.notes}
                        <div class="event-notes truncate">{task.notes}</div>
                      {/if}
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <div class="border-t border-t-dashed border-[#dadada] py-2"></div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .day-title {
    font-size: var(--fs-4);
    color: #444;
    font-weight: 600;
  }
  
  .day-title.highlight {
    color: var(--primary-color);
  }

  .routine-pill {
    background: #f5f5f5;
    border-radius: 16px;
    padding: 6px 12px;

    font-size: var(--fs-3);
    color: #555;
    font-weight: 500;
  }
  
  .done-gradient {
    background: linear-gradient(to right, rgba(76, 175, 80, 0.04), transparent);
  }

  .event-time {
    font-size: var(--fs-4);
    color: #222;
    font-weight: 500;
  }

  .event-name {
    font-size: var(--fs-4);
    color: #222;
  }

  .event-notes {
    font-size: var(--fs-3);
    color: #444;
    font-weight: 300;
  }
</style>