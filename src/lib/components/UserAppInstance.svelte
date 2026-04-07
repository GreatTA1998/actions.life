<script>
  import ListCalendar from '$lib/components/ListCalendar.svelte'
  import PhotoGrid from '/src/routes/[user]/components/PhotoGrid.svelte'
  import HabitsTab from '/src/routes/[user]/components/Routines/HabitsTab.svelte'
  import Schedule from '/src/routes/[user]/components/Schedule.svelte'
  import Settings from '/src/routes/[user]/components/Settings/index.svelte'
  import TemplateContext from '/src/routes/[user]/components/Templates/components/TemplatePopup/TemplateContext.svelte'
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte'
  import PopoverInputContext from '$lib/components/PopoverInputContext.svelte'
  import TaskPopup from '/src/routes/[user]/components/TaskPopup/TaskPopup.svelte'
  import ExtendRoutines from '/src/routes/[user]/components/ExtendRoutines.svelte'
  import { activeView } from '$lib/store'
  import { isMobile } from '$lib/utils/core.js'
  import { doc, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init'
  import { user, clickedTaskID } from '$lib/store'
  import { onMount } from 'svelte'

  let { uid } = $props()

  onMount(() => onSnapshot(doc(db, '/users/' + uid), 
    async snap => user.set({ ...snap.data() })
  ))
</script>

{#if $user.uid}
  <ExtendRoutines />

  <PopoverInputContext>
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

    <FloatingNavbar position={isMobile() ? 'right' : 'bottom'} />
    
    {#if $clickedTaskID}
      <TaskPopup />
    {/if}
  </PopoverInputContext>
{/if}