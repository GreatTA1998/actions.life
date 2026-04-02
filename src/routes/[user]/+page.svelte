<script>
  import ListCalendar from '$lib/components/ListCalendar.svelte'
  import PhotoGrid from '/src/routes/[user]/components/PhotoGrid.svelte'
  import HabitsTab from '/src/routes/[user]/components/Routines/HabitsTab.svelte'
  import Schedule from '/src/routes/[user]/components/Schedule.svelte'
  import Settings from '/src/routes/[user]/components/Settings/index.svelte'
  import TemplateContext from '/src/routes/[user]/components/Templates/components/TemplatePopup/TemplateContext.svelte'
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte'
  import { activeView } from '$lib/store'
  import { isMobile } from '$lib/utils/core.js'
</script>

<div class="h-dvh">
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