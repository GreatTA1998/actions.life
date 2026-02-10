<div class="grid-container">
  <main class="content-area">
    {#if $activeView === 'SETTINGS'}
      <Settings />
    {:else if $activeView === 'CALENDAR'}
      <DualView orientation="vertical" ratioDbField="listAreaHeightRatio" minL={MOBILE_SAFE_BOTTOM}
        {child1} 
        {child2} 
      />
      {#snippet child1 ()}<Calendar />{/snippet}
      {#snippet child2 ()}<ListArea xyScrolling={false}/>{/snippet}
    {:else if $activeView === 'SCHEDULE'}
      <Schedule />
    {:else if $activeView === 'ROUTINES'}
      <HabitsTab />
    {:else if $activeView === 'PHOTOS'}
      <PhotoGrid />
    {/if}
  </main>

  <FloatingNavbar position="right" />
</div>

<script>
  import ListArea from '$lib/components/ListArea.svelte'
  import Calendar from '/src/routes/[user]/components/Calendar/Calendar.svelte'
  import DualView from '$lib/components/DualView.svelte'
  import Settings from '../components/Settings/index.svelte'
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte'
  import PhotoGrid from '/src/routes/[user]/components/Archive/PhotoGrid.svelte'
  import HabitsTab from '/src/routes/[user]/mobile/HabitsTab.svelte'
  import Schedule from '/src/routes/[user]/mobile/Schedule.svelte'

  import { MOBILE_SAFE_BOTTOM } from '$lib/utils/constants.js'
  import { activeView } from '$lib/store'
  import { isCompact } from '../components/Calendar/store.js'
  import { onMount } from 'svelte'

  onMount(async () => {
    isCompact.set(true)
  })
</script>

<style>
  :global(body),
  :global(html) {
    overflow: hidden;
    height: 100%;
    width: 100%;
    position: fixed;
    touch-action: manipulation; /* prevents double tap to zoom and therefore tap delays, common mobile optimization */
    overscroll-behavior: none;
  }

  :global(body) {
    background: rgb(245, 245, 245); /* 240 > optimal > 220, previously #f1f3f4; */
  }
  
  .grid-container {
    display: grid;
    grid-template-rows: 1fr;
    height: 100vh;
    /* Support for iOS Safari */
    height: -webkit-fill-available;
    /* Support for modern browsers with dynamic viewport units */
    height: 100dvh;
    width: 100%;
    overflow: hidden;
    position: relative;
  }
  
  .content-area {
    grid-row: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    /* Critical for grid scrolling - allows content to be smaller than container */
    min-height: 0;
    position: relative;
  }
</style>
