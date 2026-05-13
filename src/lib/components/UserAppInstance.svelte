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
  import { activeView } from '$lib/store'
  import { isMobile } from '$lib/utils/core.js'
  import { doc, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init'
  import { user } from '$lib/store'
  import { onMount } from 'svelte'

  let { uid } = $props()

  user.set({})

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
</script>

{#if $user.uid}
  <AppContext>
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