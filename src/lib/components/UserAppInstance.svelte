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

  let { uid } = $props()

  initialDataReady.set(false)
  user.set({})
  activeView.set('CALENDAR')

  onMount(() => 
    onSnapshot(
      doc(db, '/users/' + uid), 
      snap => {
        // Persistent cache may deliver an empty snap before the first network fill;
        // ignore empties so we don't wipe hydrated UI mid-boot.
        if (!snap.exists()) return
        user.set({ id: snap.id, ...snap.data() })
      },
      error => {
        // Offline with a warm IndexedDB cache still serves via the success path.
        // Unavailable / failed-precondition without cache should not freeze the shell.
        if (!navigator.onLine) return
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