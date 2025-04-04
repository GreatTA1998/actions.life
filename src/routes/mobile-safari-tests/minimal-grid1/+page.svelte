<script>
  // Minimal Grid Version 1 - Full-featured grid solution
</script>

<svelte:head>
  <title>Minimal Grid 1: Full-featured</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
</svelte:head>

<div class="grid-container">
  <main class="content">
    <h2>Minimal Grid 1: Full-featured</h2>
    <p>This version includes all grid fixes and optimizations.</p>
    {#each Array(50) as _, i}
      <div class="item">Item {i + 1}</div>
    {/each}
  </main>
  <nav class="navbar">
    <div>Home</div>
    <div>Search</div>
    <div>Profile</div>
  </nav>
</div>

<style>
  /* Reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  /* Prevent any scrolling on body */
  :global(body),
  :global(html) {
    overflow: hidden;
    height: 100%;
    width: 100%;
    position: fixed;
    touch-action: none;
  }
  
  .grid-container {
    display: grid;
    /* Explicitly set row size with minmax to ensure scrolling works */
    grid-template-rows: minmax(0, 1fr) 60px;
    height: 100vh;
    /* Fallback for browsers that don't support vh */
    height: 100%;
    /* Support for iOS Safari */
    height: -webkit-fill-available;
    width: 100%;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  
  .content {
    grid-row: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    /* Critical for grid scrolling - allows content to be smaller than container */
    min-height: 0;
    position: relative;
    padding: 20px;
    /* Add bottom padding to ensure content isn't hidden behind navbar */
    padding-bottom: 20px;
  }
  
  .item {
    padding: 15px;
    margin-bottom: 10px;
    background-color: #f0f0f0;
    border-radius: 8px;
  }
  
  .navbar {
    grid-row: 2;
    height: 60px;
    background-color: #333;
    color: white;
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 10;
  }
</style> 