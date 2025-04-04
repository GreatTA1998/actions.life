<script>
  // Index for mobile safari tests
</script>

<svelte:head>
  <title>Mobile Safari Spacing Tests</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
</svelte:head>

<div class="container">
  <h1>Mobile Safari Spacing Tests</h1>
  <p>Testing different solutions for the mobile Safari spacing bug</p>
  
  <h2>Grid Layout Versions</h2>
  <div class="version-list">
    <a href="/mobile-safari-tests/version1" class="version-link">
      <h3>Version 1: Fixed + Flex</h3>
      <p>Using fixed positioning for navbar and flex for content layout</p>
    </a>
    
    <a href="/mobile-safari-tests/version2" class="version-link">
      <h3>Version 2: CSS Grid</h3>
      <p>Using CSS Grid for the entire layout structure</p>
    </a>
  </div>
  
  <h2>Minimal Grid Test Versions</h2>
  <div class="version-list">
    <a href="/mobile-safari-tests/minimal-grid1" class="version-link">
      <h3>Minimal Grid 1: Full-featured</h3>
      <p>Complete grid solution with all possible Safari fixes</p>
    </a>
    
    <a href="/mobile-safari-tests/minimal-grid2" class="version-link">
      <h3>Minimal Grid 2: Simplified Positioning</h3>
      <p>Grid with simplified positioning and fewer constraints</p>
    </a>
    
    <a href="/mobile-safari-tests/minimal-grid3" class="version-link">
      <h3>Minimal Grid 3: Essential Safari Fixes</h3>
      <p>Only the essential fixes for Safari</p>
    </a>
    
    <a href="/mobile-safari-tests/minimal-grid4" class="version-link">
      <h3>Minimal Grid 4: Bare Minimum</h3>
      <p>Minimal grid properties required for layout</p>
    </a>
    
    <a href="/mobile-safari-tests/minimal-grid5" class="version-link">
      <h3>Minimal Grid 5: Absolute Minimal</h3>
      <p>The most minimal grid layout possible</p>
    </a>
  </div>
  
  <div class="notes">
    <h3>Test Notes:</h3>
    <ul>
      <li>Test each version on iOS Safari devices</li>
      <li>Look for unwanted scrolling or spacing outside the body</li>
      <li>Check behavior when address bar shows/hides</li>
      <li>Note which version works with minimal CSS</li>
    </ul>
  </div>
</div>

<style>
  /* Base styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1 {
    margin-bottom: 10px;
  }
  
  h2 {
    margin: 25px 0 10px 0;
  }
  
  p {
    margin-bottom: 20px;
  }
  
  .version-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 30px;
  }
  
  .version-link {
    display: block;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 8px;
    text-decoration: none;
    color: #333;
    transition: background-color 0.2s;
  }
  
  .version-link:hover {
    background-color: #e5e5e5;
  }
  
  .version-link h3 {
    font-size: 18px;
    margin-bottom: 5px;
  }
  
  .notes {
    padding: 15px;
    background-color: #fffae6;
    border-radius: 8px;
  }
  
  .notes h3 {
    margin-bottom: 10px;
  }
  
  .notes ul {
    padding-left: 20px;
  }
  
  .notes li {
    margin-bottom: 5px;
  }
</style> 