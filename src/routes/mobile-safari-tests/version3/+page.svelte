<script>
  // Setup for mobile-safari-tests version 3
</script>

<svelte:head>
  <title>Safari Test 3: Viewport Units + Safe Area</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
</svelte:head>

<div class="app-container">
  <div class="content-area">
    <h2>Version 3: Viewport Units + Safe Area</h2>
    <p>Scroll test with env() safe area insets for iOS.</p>
    {#each Array(50) as _, i}
      <div class="item">Item {i + 1}</div>
    {/each}
  </div>
  <div class="navbar">
    <div>Home</div>
    <div>Search</div>
    <div>Profile</div>
  </div>
</div>

<style>
  /* Reset and base styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  /* Disable scrolling on html/body */
  :global(html),
  :global(body) {
    overflow: hidden;
    height: 100%;
    width: 100%;
    position: relative;
    touch-action: none;
  }
  
  .app-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
  }
  
  .content-area {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 20px;
    padding-bottom: calc(60px + env(safe-area-inset-bottom));
  }
  
  .item {
    padding: 15px;
    margin-bottom: 10px;
    background-color: #f0f0f0;
    border-radius: 8px;
  }
  
  .navbar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: calc(60px + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background-color: #333;
    color: white;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
</style> 