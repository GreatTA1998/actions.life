<script>
  import AppContent from '$lib/components/AppContent.svelte'
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte'

  import { isCompact } from '../components/Calendar/store.js'
  import { onMount } from 'svelte'

  onMount(async () => {
    isCompact.set(true)
  })
</script>

<div class="grid-container">
  <main class="content-area">
    <AppContent />
  </main>

  <FloatingNavbar position="right" />
</div>

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
