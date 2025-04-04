<script>
  // Minimal Grid Version 4 - Bare minimum grid
</script>

<svelte:head>
  <title>Minimal Grid 4: Bare Minimum</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
</svelte:head>

<div class="grid-container">
  <main class="content">
    <h2>Minimal Grid 4: Bare Minimum</h2>
    <p>This version uses only the minimal grid properties required.</p>
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
  * {
    margin: 0;
    padding: 0;
  }
  
  .grid-container {
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100vh;
    width: 100%;
  }
  
  .content {
    overflow-y: auto;
    padding: 20px;
  }
  
  .item {
    padding: 15px;
    margin-bottom: 10px;
    background-color: #f0f0f0;
    border-radius: 8px;
  }
  
  .navbar {
    height: 60px;
    background-color: #333;
    color: white;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
</style> 