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
  
  <div class="version-list">
    <a href="/mobile-safari-tests/version1" class="version-link">
      <h2>Version 1: Fixed + Flex</h2>
      <p>Using fixed positioning for navbar and flex for content layout</p>
    </a>
    
    <a href="/mobile-safari-tests/version2" class="version-link">
      <h2>Version 2: CSS Grid</h2>
      <p>Using CSS Grid for the entire layout structure</p>
    </a>
    
    <a href="/mobile-safari-tests/version3" class="version-link">
      <h2>Version 3: Viewport Units + Safe Area</h2>
      <p>Using env() safe area insets for iOS</p>
    </a>
    
    <a href="/mobile-safari-tests/version4" class="version-link">
      <h2>Version 4: JS Height Fix</h2>
      <p>Using JavaScript to dynamically set the container height</p>
    </a>
  </div>
  
  <div class="notes">
    <h3>Test Notes:</h3>
    <ul>
      <li>Each version implements a different approach to fixing the spacing bug</li>
      <li>Test on actual iOS Safari devices for best results</li>
      <li>Look for unwanted scrolling or spacing outside the body</li>
      <li>Check behavior when address bar shows/hides</li>
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
  
  .version-link h2 {
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