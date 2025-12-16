{#if $user.uid}
  {#if $isTaskPopupOpen}
    <TaskPopup/>
  {/if}

  <div class="grid-container">
    <main class="content-area">
      {#if $activeView === 'CALENDAR'}
        <DualView orientation="vertical" 
          {child1} {child2} 
          ratioDbField="listAreaHeightRatio"
        />

        {#snippet child1 ()}
          <Calendar />
        {/snippet}

        {#snippet child2 ()}
          <UnifiedListArea xyScrolling={false} />
        {/snippet}
      {:else if $activeView === 'DISCOVER'}
        <Discover />
      {:else if $activeView === 'SETTINGS'}
        <Settings />
      {/if}
    </main>

    <FloatingNavbar position="right" />
  </div>
{/if}

<script>
  import UnifiedListArea from '$lib/components/UnifiedListArea.svelte'
  import Calendar from '/src/routes/[user]/components/Calendar/Calendar.svelte'
  import DualView from '$lib/components/DualView.svelte'
  import TaskPopup from '../components/TaskPopup/TaskPopup.svelte'
  import Discover from './Discover.svelte'
  import Settings from '../components/Settings/index.svelte'
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte'

  import { user, isTaskPopupOpen, activeView } from '/src/lib/store'
  import { isCompact } from '../components/Calendar/store.js'
  import { onDestroy, onMount } from 'svelte'

  let unsub

  onMount(async () => {
    isCompact.set(true)
  })

  onDestroy(() => {
    if (unsub) unsub()
  })
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
</svelte:head>

<style>
  :global(body),
  :global(html) {
    overflow: hidden;
    height: 100%;
    width: 100%;
    position: fixed;
    touch-action: manipulation;
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
