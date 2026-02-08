<script>
  import NavbarContentLayout from '$lib/components/NavbarContentLayout.svelte'
  import DualView from '$lib/components/DualView.svelte'
  import Settings from './components/Settings/index.svelte'
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte'
  import Calendar from '/src/routes/[user]/components/Calendar/Calendar.svelte'
  import ListArea from '$lib/components/ListArea.svelte'
  import PhotoGrid from '/src/routes/[user]/components/Archive/PhotoGrid.svelte'
  import HabitsTab from '/src/routes/[user]/mobile/HabitsTab.svelte'
  import Schedule from '/src/routes/[user]/mobile/Schedule.svelte'
  import { activeView } from '$lib/store'
</script>

<NavbarContentLayout>
  <div slot="content" class="grow relative z-0 flex h-full">
    {#if $activeView === 'SETTINGS'}
      <Settings />
    {:else if $activeView === 'CALENDAR'}
      <DualView {child1} {child2} />
      {#snippet child1 ()}<ListArea xyScrolling />{/snippet}
      {#snippet child2 ()}<Calendar />{/snippet}
    {:else if $activeView === 'SCHEDULE'}
      <Schedule />
    {:else if $activeView === 'ROUTINES'}
      <HabitsTab />
    {:else if $activeView === 'PHOTOS'}
      <PhotoGrid />
    {/if}
  </div>
</NavbarContentLayout>

<FloatingNavbar position="bottom" />