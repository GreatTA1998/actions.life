<script>
  // Setup for mobile-safari-tests version 1
</script>

<svelte:head>
  <title>Safari Test 1: Fixed + Flex</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
</svelte:head>

<div class="container">
  <div class="content">
    <h2>Version 1: Fixed navbar + flex content</h2>
    <p>Scroll test with fixed positioning for navbar.</p>
    {#each Array(50) as _, i}
      <div class="item">Item {i + 1}</div>
    {/each}
  </div>
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
  
  /* Prevent scrolling on body */
  :global(body) {
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
  }
  
  .container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
  
  .content {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 20px;
    padding-bottom: 80px; /* Add padding to account for navbar */
  }
  
  .item {
    padding: 15px;
    margin-bottom: 10px;
    background-color: #f0f0f0;
    border-radius: 8px;
  }
  
  .navbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: #333;
    color: white;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
</style> 