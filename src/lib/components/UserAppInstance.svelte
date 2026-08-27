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
  import { onMount, getContext } from 'svelte'

  let { uid, onSeedDataReady = $bindable(null) } = $props()

  initialDataReady.set(false)
  user.set({})
  activeView.set('CALENDAR')

  // Will be set from AppContext via context
  let treesByDateStore = null
  let treesByIDStore = null

  // Expose callback for seed data hydration
  onSeedDataReady = (seedTasks) => {
    if (treesByDateStore && treesByIDStore) {
      hydrateSeedData(seedTasks, treesByDateStore, treesByIDStore)
    }
  }

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

    // Organize by date
    const dateToTasks = {}
    for (const tree of forest.values()) {
      if (tree.startDateISO && !tree.parentID) { // Only root tasks
        const date = tree.startDateISO
        if (!dateToTasks[date]) {
          dateToTasks[date] = { hasStartTime: [], noStartTime: { hasIcon: [], noIcon: [] } }
        }
        
        if (tree.startTime) {
          dateToTasks[date].hasStartTime.push(tree)
        } else if (tree.iconURL) {
          dateToTasks[date].noStartTime.hasIcon.push(tree)
        } else {
          dateToTasks[date].noStartTime.noIcon.push(tree)
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