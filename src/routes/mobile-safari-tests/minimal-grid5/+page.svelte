<script>
  // Minimal Grid Version 5 - Absolute minimal
</script>

<svelte:head>
  <title>Minimal Grid 5: Absolute Minimal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
</svelte:head>

<div class="container">
  <main class="content">
    <h2>Minimal Grid 5: Absolute Minimal</h2>
    <p>This version uses only the absolutely essential grid properties.</p>
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
  .container {
    display: grid;
    grid-template-rows: 1fr 60px;
    height: 100vh;
  }
  
  .content {
    overflow-y: auto;
  }
  
  .item {
    padding: 15px;
    margin: 10px;
    background-color: #f0f0f0;
  }
  
  .navbar {
    background-color: #333;
    color: white;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
</style> 