<script>
  import { activeView } from '$lib/store'
  import ListCalendar from '$lib/components/ListCalendar.svelte'
  import PhotoGrid from '/src/routes/[user]/components/Archive/PhotoGrid.svelte'
  import HabitsTab from '/src/routes/[user]/mobile/HabitsTab.svelte'
  import Schedule from '/src/routes/[user]/mobile/Schedule.svelte'
  import Settings from '/src/routes/[user]/components/Settings/index.svelte'
</script>

{#if $activeView === 'SETTINGS'}
  <Settings />
{:else if $activeView === 'CALENDAR'}
  <ListCalendar />
{:else if $activeView === 'SCHEDULE'}
  <Schedule />
{:else if $activeView === 'ROUTINES'}
  <HabitsTab />
{:else if $activeView === 'PHOTOS'}
  <PhotoGrid />
{/if}