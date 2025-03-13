<script>
  import { onMount } from 'svelte';
  import CurrentDesign from './TimelineDesignDemo/CurrentDesign.svelte';
  import InlineBadges from './TimelineDesignDemo/InlineBadges.svelte';
  import VerticalDates from './TimelineDesignDemo/VerticalDates.svelte';
  import CompactDates from './TimelineDesignDemo/CompactDates.svelte';
  import ReducedIndent from './TimelineDesignDemo/ReducedIndent.svelte';
  
  // Sample task data with nested structure
  const sampleTasks = [
    {
      id: 1,
      text: "Main Project",
      completed: false,
      date: "2023-03-13",
      children: [
        {
          id: 2,
          text: "Research Phase",
          completed: true,
          date: "2023-05-07",
          children: [
            {
              id: 3,
              text: "Collect Requirements",
              completed: true,
              date: "2023-05-10",
              children: []
            },
            {
              id: 4,
              text: "Market Analysis",
              completed: true,
              date: "2023-05-15",
              children: []
            }
          ]
        },
        {
          id: 5,
          text: "Development Phase",
          completed: false,
          date: "2023-08-20",
          children: [
            {
              id: 6,
              text: "Frontend Implementation",
              completed: false,
              date: "2023-09-01",
              children: []
            },
            {
              id: 7,
              text: "Backend Integration",
              completed: false,
              date: "2023-09-15",
              children: []
            }
          ]
        }
      ]
    }
  ];
  
  // Format date for display
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Format date in compact form
  function formatCompactDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  
  let activeDesign = 'current';
</script>

<div class="design-demo-container">
  <h1>Timeline Design Options</h1>
  
  <div class="design-selector">
    <button class:active={activeDesign === 'current'} on:click={() => activeDesign = 'current'}>
      Current Design
    </button>
    <button class:active={activeDesign === 'inline-badges'} on:click={() => activeDesign = 'inline-badges'}>
      Inline Date Badges
    </button>
    <button class:active={activeDesign === 'vertical-dates'} on:click={() => activeDesign = 'vertical-dates'}>
      Vertical Date Alignment
    </button>
    <button class:active={activeDesign === 'compact-dates'} on:click={() => activeDesign = 'compact-dates'}>
      Compact Date Format
    </button>
    <button class:active={activeDesign === 'reduced-indent'} on:click={() => activeDesign = 'reduced-indent'}>
      Reduced Indentation
    </button>
  </div>
  
  <div class="timeline-demo">
    {#if activeDesign === 'current'}
      <!-- Current Design (Similar to existing implementation) -->
      <div class="design-description">
        <h2>Current Design</h2>
        <p>Dates are positioned to the left of the timeline, taking up horizontal space.</p>
      </div>
      
      <div class="current-design">
        {#each sampleTasks as task}
          <CurrentDesign {task} level={0} />
        {/each}
      </div>
    {:else if activeDesign === 'inline-badges'}
      <!-- Inline Date Badges Design -->
      <div class="design-description">
        <h2>Inline Date Badges</h2>
        <p>Dates appear as small badges next to the task text, reducing horizontal space.</p>
      </div>
      
      <div class="inline-badges-design">
        {#each sampleTasks as task}
          <InlineBadges {task} level={0} />
        {/each}
      </div>
    {:else if activeDesign === 'vertical-dates'}
      <!-- Vertical Date Alignment Design -->
      <div class="design-description">
        <h2>Vertical Date Alignment</h2>
        <p>Dates are positioned directly on the timeline, minimizing horizontal impact.</p>
      </div>
      
      <div class="vertical-dates-design">
        {#each sampleTasks as task}
          <VerticalDates {task} level={0} />
        {/each}
      </div>
    {:else if activeDesign === 'compact-dates'}
      <!-- Compact Date Format Design -->
      <div class="design-description">
        <h2>Compact Date Format</h2>
        <p>Dates use a more compact format (MM/DD) to save space.</p>
      </div>
      
      <div class="compact-dates-design">
        {#each sampleTasks as task}
          <CompactDates {task} level={0} />
        {/each}
      </div>
    {:else if activeDesign === 'reduced-indent'}
      <!-- Reduced Indentation Design -->
      <div class="design-description">
        <h2>Reduced Indentation</h2>
        <p>Child items use less indentation to prevent excessive horizontal space usage.</p>
      </div>
      
      <div class="reduced-indent-design">
        {#each sampleTasks as task}
          <ReducedIndent {task} level={0} />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .design-demo-container {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .design-selector {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  
  .design-selector button {
    padding: 8px 12px;
    border: 1px solid #ccc;
    background: #f5f5f5;
    cursor: pointer;
    border-radius: 4px;
  }
  
  .design-selector button.active {
    background: #4CAF50;
    color: white;
    border-color: #4CAF50;
  }
  
  .design-description {
    margin-bottom: 20px;
    padding: 10px;
    background: #f9f9f9;
    border-left: 4px solid #4CAF50;
  }
  
  .design-description h2 {
    margin-top: 0;
  }
  
  /* Common Timeline Styles */
  .timeline-item {
    position: relative;
    padding-left: 20px;
    margin-bottom: 15px;
  }
  
  .timeline-line {
    position: absolute;
    top: 0;
    left: 8px;
    width: 2px;
    height: 100%;
    background-color: #ddd;
    z-index: 0;
  }
  
  .task-content {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  
  .circle {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #ccc;
    background-color: white;
    margin-right: 10px;
  }
  
  .circle.completed {
    background-color: #4CAF50;
    border-color: #4CAF50;
  }
  
  .task-text {
    font-size: 14px;
  }
  
  .children-container {
    margin-top: 10px;
  }
  
  /* Current Design Styles */
  .current-design .date-indicator {
    position: absolute;
    left: -40px;
    display: flex;
    align-items: center;
  }
  
  .current-design .date-marker {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #4CAF50;
    left: 0;
    transform: translateX(-5px);
  }
  
  .current-design .date-label {
    position: absolute;
    left: 10px;
    font-size: 12px;
    color: #666;
    white-space: nowrap;
  }
  
  /* Inline Badges Design Styles */
  .inline-badges-design .date-badge {
    font-size: 11px;
    background-color: #f0f0f0;
    border-radius: 10px;
    padding: 2px 6px;
    margin-left: 8px;
    color: #666;
  }
  
  /* Vertical Dates Design Styles */
  .vertical-dates-design .date-on-line {
    position: absolute;
    left: 8px;
    transform: translateX(-50%);
    background-color: white;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 3px;
    border: 1px solid #ddd;
    color: #666;
    z-index: 2;
  }
  
  /* Compact Dates Design Styles */
  .compact-dates-design .date-indicator {
    position: absolute;
    left: -30px; /* Less space needed */
    display: flex;
    align-items: center;
  }
  
  .compact-dates-design .date-marker {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #4CAF50;
    left: 0;
    transform: translateX(-5px);
  }
  
  .compact-dates-design .date-label {
    position: absolute;
    left: 10px;
    font-size: 11px;
    color: #666;
    white-space: nowrap;
  }
  
  /* Reduced Indentation Design Styles */
  .reduced-indent-design .date-indicator {
    position: absolute;
    left: -40px;
    display: flex;
    align-items: center;
  }
  
  .reduced-indent-design .date-marker {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #4CAF50;
    left: 0;
    transform: translateX(-5px);
  }
  
  .reduced-indent-design .date-label {
    position: absolute;
    left: 10px;
    font-size: 12px;
    color: #666;
    white-space: nowrap;
  }
</style> 