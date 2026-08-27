<script>
  import AppContext from '$lib/components/AppContext.svelte'
  import TaskPopupContext from '$lib/components/TaskPopupContext.svelte'
  import DragDropContext from '$lib/components/DragDropContext.svelte'
  import ListCalendar from '$lib/components/ListCalendar.svelte'
  import PhotoGrid from '/src/routes/[user]/components/PhotoGrid.svelte'
  import HabitsTab from '/src/routes/[user]/components/Routines/HabitsTab.svelte'
  import Schedule from '/src/routes/[user]/components/Schedule.svelte'
  import Settings from '/src/routes/[user]/components/Settings/index.svelte'
  import TemplateContext from '/src/routes/[user]/components/Templates/components/TemplatePopup/TemplateContext.svelte'
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte'
  import PopoverInputContext from '$lib/components/PopoverInputContext.svelte'
  import ExtendRoutines from '/src/routes/[user]/components/ExtendRoutines.svelte'
  import TheSnackbar from '/src/routes/[user]/components/TheSnackbar.svelte'
  import { reportError } from '$lib/utils/errors.js'
  import { activeView, user, initialDataReady } from '$lib/store'
  import { isMobile } from '$lib/utils/core.js'
  import { doc, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init'
  import { onMount } from 'svelte'

  let { uid, seedTasks = null } = $props()

  initialDataReady.set(false)
  user.set({})
  activeView.set('CALENDAR')

  let treesByDateStore = null
  let treesByIDStore = null

  // Hydrate seed data after AppContext provides stores
  $effect(() => {
    if (seedTasks && treesByDateStore && treesByIDStore) {
      hydrateSeedData(seedTasks, treesByDateStore, treesByIDStore)
    }
  })

  onMount(() => 
    onSnapshot(
      doc(db, '/users/' + uid), 
      snap => user.set({ ...snap.data() }),
      error => {
        reportError({
          subject: 'onSnapshot () for /users/uid failed',
          content: `code: ${error.code ?? ''}\nmessage: ${error.message}\nstack: ${error.stack ?? ''}`
        })
      }
    )
  )

  $effect(() => {
    if ($user.uid) {
      document.documentElement.style.setProperty(
        'font-size',
        `${($user.fontScale || 1) * (isMobile() ? 1.5 : 1) * 100}%`
      )
    }
  })

  function hydrateSeedData(seedTasks, treesByDate, treesByID) {
    // Build forest structure
    const forest = new Map()
    
    for (const task of seedTasks) {
      forest.set(task.id, { ...task, children: [] })
    }
    
    // Build parent-child relationships
    for (const tree of forest.values()) {
      if (tree.parentID && forest.has(tree.parentID)) {
        forest.get(tree.parentID).children.push(tree)
      }
    }

    // Sort children by orderValue
    for (const tree of forest.values()) {
      tree.children.sort((a, b) => a.orderValue - b.orderValue)
    }

    // Update treesByID
    const treesById = {}
    for (const [id, tree] of forest) {
      treesById[id] = tree
    }
    treesByID.set(treesById)

    // Organize by date - match calendar service logic
    // The calendar queries by array-contains-any on treeISOs, then filters to roots with startDateISO
    const dateToTasks = {}
    
    // Collect all unique dates from all tasks
    const allDates = new Set()
    for (const task of seedTasks) {
      for (const date of task.treeISOs) {
        allDates.add(date)
      }
    }

    // For each date, find all tasks with that date in treeISOs, build forest, filter to scheduled roots
    for (const date of allDates) {
      const tasksForDate = seedTasks.filter(t => t.treeISOs.includes(date))
      
      // Build forest from these tasks
      const regionForest = []
      for (const task of tasksForDate) {
        if (!task.parentID) {
          regionForest.push(forest.get(task.id))
        }
      }
      
      // Filter to only roots that have a startDateISO (scheduled trees)
      const scheduledTrees = regionForest.filter(tree => tree.startDateISO)
      
      if (scheduledTrees.length > 0) {
        if (!dateToTasks[date]) {
          dateToTasks[date] = { hasStartTime: [], noStartTime: { hasIcon: [], noIcon: [] } }
        }
        
        // Organize each scheduled tree by its properties
        for (const tree of scheduledTrees) {
          if (tree.startTime) {
            dateToTasks[date].hasStartTime.push(tree)
          } else if (tree.iconURL) {
            dateToTasks[date].noStartTime.hasIcon.push(tree)
          } else {
            dateToTasks[date].noStartTime.noIcon.push(tree)
          }
        }
      }
    }

    // Sort tasks within each category
    for (const taskGroups of Object.values(dateToTasks)) {
      if (taskGroups.noStartTime?.noIcon?.length > 0) {
        taskGroups.noStartTime.noIcon.sort((a, b) => a.orderValue - b.orderValue)
      }
      if (taskGroups.hasStartTime?.length > 0) {
        taskGroups.hasStartTime.sort((a, b) => {
          const aHour = parseFloat(a.startTime.replace(':', '.'))
          const bHour = parseFloat(b.startTime.replace(':', '.'))
          return aHour - bHour
        })
      }
    }

    treesByDate.set(dateToTasks)
  }
</script>

{#if $user.uid}
  <AppContext bind:treesByDateStore bind:treesByIDStore>
    <DragDropContext>
      <ExtendRoutines />

      <PopoverInputContext>
        <TaskPopupContext>
          <div style:height="100%">
            {#if $activeView === 'SETTINGS'}
              <Settings />
            {:else if $activeView === 'CALENDAR'}
              <ListCalendar />
            {:else if $activeView === 'SCHEDULE'}
              <Schedule />
            {:else if $activeView === 'ROUTINES'}
              <TemplateContext>
                <HabitsTab />
              </TemplateContext>
            {:else if $activeView === 'PHOTOS'}
              <PhotoGrid />
            {/if}
          </div> 
        </TaskPopupContext>
      </PopoverInputContext>
    </DragDropContext>

    <FloatingNavbar position={isMobile() ? 'right' : 'bottom'} />

    <TheSnackbar />
  </AppContext>
{/if}