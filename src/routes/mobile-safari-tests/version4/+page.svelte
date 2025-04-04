<script>
  // Setup for mobile-safari-tests version 4
  import { onMount } from 'svelte'
  
  let appHeight
  
  onMount(() => {
    // Fix for iOS viewport height issues
    const setAppHeight = () => {
      appHeight = window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${appHeight}px`)
    }
    
    setAppHeight()
    window.addEventListener('resize', setAppHeight)
    
    return () => {
      window.removeEventListener('resize', setAppHeight)
    }
  })
</script>

<svelte:head>
  <title>Safari Test 4: JS Height Fix</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
</svelte:head>

<div class="test-container">
  <div class="scrollable-content">
    <h2>Version 4: JS Height Fix</h2>
    <p>Scroll test with JavaScript dynamic height calculation.</p>
    <p>App height: {appHeight}px</p>
    {#each Array(50) as _, i}
      <div class="item">Item {i + 1}</div>
    {/each}
  </div>
  <div class="nav-bar">
    <div>Home</div>
    <div>Search</div>
    <div>Profile</div>
  </div>
</div>

<style>
  /* Root variables */
  :global(:root) {
    --app-height: 100vh;
    --nav-height: 60px;
  }
  
  /* Reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  /* Prevent any scrolling on body */
  :global(html),
  :global(body) {
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
    /* Prevent iOS bounce effect */
    overscroll-behavior: none;
  }
  
  .test-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: var(--app-height);
    display: flex;
    flex-direction: column;
  }
  
  .scrollable-content {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 20px;
    height: calc(var(--app-height) - var(--nav-height));
  }
  
  .item {
    padding: 15px;
    margin-bottom: 10px;
    background-color: #f0f0f0;
    border-radius: 8px;
  }
  
  .nav-bar {
    height: var(--nav-height);
    background-color: #333;
    color: white;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-shrink: 0;
  }
</style> 