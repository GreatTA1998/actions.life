<script>
  // Minimal Grid Version 3 - Essential Safari fixes only
</script>

<svelte:head>
  <title>Minimal Grid 3: Essential Safari Fixes</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
</svelte:head>

<div class="grid-container">
  <main class="content">
    <h2>Minimal Grid 3: Essential Safari Fixes</h2>
    <p>This version keeps only the essential fixes for Safari.</p>
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
  
  :global(body) {
    overflow: hidden;
  }
  
  .grid-container {
    display: grid;
    grid-template-rows: 1fr 60px;
    height: 100vh;
    height: -webkit-fill-available;
    overflow: hidden;
  }
  
  .content {
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
    background-color: #333;
    color: white;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
</style> 