<script>
  // Minimal Grid Version 2 - Simplified positioning
</script>

<svelte:head>
  <title>Minimal Grid 2: Simplified Positioning</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
</svelte:head>

<div class="grid-container">
  <main class="content">
    <h2>Minimal Grid 2: Simplified Positioning</h2>
    <p>This version removes absolute positioning and simplifies layout.</p>
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
  }
  
  .grid-container {
    display: grid;
    grid-template-rows: minmax(0, 1fr) 60px;
    height: 100vh;
    /* Support for iOS Safari */
    height: -webkit-fill-available;
    width: 100%;
    overflow: hidden;
  }
  
  .content {
    grid-row: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    min-height: 0;
    padding: 20px;
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
  }
</style> 