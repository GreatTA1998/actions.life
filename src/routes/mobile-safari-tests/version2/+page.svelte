<script>
  // Setup for mobile-safari-tests version 2
</script>

<svelte:head>
  <title>Safari Test 2: CSS Grid</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
</svelte:head>

<div class="grid-container">
  <main class="content">
    <h2>Version 2: CSS Grid Layout</h2>
    <p>Scroll test with CSS Grid for layout structure.</p>
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
  }
  
  .grid-container {
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100vh;
    height: -webkit-fill-available;
    width: 100%;
    overflow: hidden;
  }
  
  .content {
    grid-row: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
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