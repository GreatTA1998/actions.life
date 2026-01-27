<script>
  import NavbarContentLayout from '$lib/components/NavbarContentLayout.svelte'
  import DualView from '$lib/components/DualView.svelte'
  import Settings from './components/Settings/index.svelte'
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte'
  import Calendar from '/src/routes/[user]/components/Calendar/Calendar.svelte'
  import UnifiedListArea from '$lib/components/UnifiedListArea.svelte'
  import PhotoGrid from '/src/routes/[user]/components/Archive/PhotoGrid.svelte'
  import HabitsTab from '/src/routes/[user]/mobile/HabitsTab.svelte'
  import ScheduleTab from '/src/routes/[user]/mobile/ScheduleTab.svelte'
  import { activeView } from '$lib/store'
</script>

<NavbarContentLayout>
  <div slot="content" class="relative z-0 flexbox h-full" style="flex-grow: 1;">
    {#if $activeView === 'SETTINGS'}
      <Settings />
    {:else if $activeView === 'CALENDAR'}
      <DualView {child1} {child2} />
      {#snippet child1 ()}<UnifiedListArea xyScrolling />{/snippet}
      {#snippet child2 ()}<Calendar />{/snippet}
    {:else if $activeView === 'SCHEDULE'}
      <ScheduleTab />
    {:else if $activeView === 'ROUTINES'}
      <HabitsTab />
    {:else if $activeView === 'PHOTOS'}
      <PhotoGrid />
    {/if}
  </div>
</NavbarContentLayout>

<FloatingNavbar position="bottom" />