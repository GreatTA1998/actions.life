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
      class="flex-1 overflow-y-auto scroll-smooth pb-[80px]" 
    >
      {#each loadedDays as day, i (day.dateISO)}
        {@const filteredTasks = $user.hideRoutines ? day.tasks.filter(t => !t.templateID) : day.tasks}
        <div class="day-section" id="day-{day.dateISO}">
          {#if filteredTasks.length > 0}
            <div class={[
              'text-lg font-semibold p-4',
              selectedDate.hasSame(day.date, 'day') ? 'text-[var(--primary-color)]' : 'text-[#444]'
            ]} 
            >
              <span class="uppercase mr-1">{day.date.toFormat('cccc')}</span>
              <span>{day.date.toFormat('MMM d')}</span>
            </div>
          {/if}

          {#if filteredTasks.length > 0}
            <div class="pb-4">
              {#if getRoutineTasks(filteredTasks).length > 0}
                <div class="flex items-center flex-wrap gap-3 px-4 pb-4">
                  {#each getRoutineTasks(filteredTasks) as task (task.id)}
                    {#if task.iconURL}
                      <DoodleIcon iconTask={task} size={40} />
                    {:else}
                      <button onclick={() => openTaskPopup(task)}
                        class={[
                          'bg-[#f5f5f5] rounded-2xl py-1.5 px-3 text-base font-medium justify-start',
                          task.isDone ? 'text-[#1e8e24]' : 'text-[#555]'
                        ]} 
                      >
                        {task.name}
                      </button>
                    {/if}
                  {/each}
                </div>
              {/if}

              <div class="flex flex-col px-4">
                {#each getRegularTasks(filteredTasks) as task (task.id)}
                  <button onclick={() => openTaskPopup(task)}
                    class={[
                      'text-left justify-start gap-x-4 py-1',
                      task.isDone && 'bg-gradient-to-r from-[rgba(76,175,80,0.04)] to-transparent'
                    ]}
                  >
                    {#if task.startTime}
                      <div class="shrink-0 text-lg text-[#222] font-medium">
                        {formatTime(task.startTime)}
                      </div>
                    {/if}
                    
                    <div class="min-w-0">
                      <div class="text-lg text-[#222]">
                        {task.name}
                      </div>
                      <div class="text-base text-[#444] font-light truncate">
                        {task.notes}
                      </div>
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