<script>
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import { DateTime } from 'luxon'
  import '$lib/styles/demo-shared.css'
  import { getContext } from 'svelte'
  
  const { memoryTree } = getContext('app')

  $: habits = $memoryTree.filter(t => t.iconURL)

  const today = DateTime.now()
</script>

<div class="demo-section">
  <div class="demo-header">
    <h2>Double-click any habit icon</h2>
    <p class="demo-hint">to mark it as complete</p>
  </div>
  
  <div class="demo-layout">
    <div class="day-column">
      <div class="day-header">
        <div class="compact-horizontal">
          <div class="center-flex day-name-label active-day-name">
            {today.toFormat('ccc')}
          </div>
          <div class="center-flex date-number">
            <div class="center-flex active-date-number">
              {today.toFormat('dd')}
            </div>
          </div>
        </div>
      </div>

      <div class="habits-area">
        <div class="icon-habits">
          {#each habits as habit}
            <DoodleIcon iconTask={habit} size={36} />
          {/each}
        </div>
      </div>
    </div>

    <div class="demo-panel">
      <div class="feature-explanation">
        <p>
          On most calendars, tracking small habits take up too much space, creating visual clutter.
          <br><br>
          In actions.life, you can display habits compactly with icons (or draw your own).
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .demo-section {
    max-width: 900px;
    margin: 48px auto;
    padding: 0 24px;
  }

  .demo-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .demo-header h2 {
    margin-bottom: 8px;
    font-size: 28px;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.01em;
  }

  .demo-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 56px;
    align-items: start;
  }

  .day-column {
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }

  /* Real DayHeader styles */
  .day-header {
    width: 100%;
    padding: 20px 0 18px;
    background-color: #fafafa;
    border-bottom: 1px solid #e5e7eb;
  }

  .compact-horizontal {
    display: flex;
    justify-content: center;
  }

  .center-flex {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .day-name-label {
    font-size: 15px;
    margin-bottom: 0px;
    font-weight: 500;
    color: #6b7280;
  }

  .active-day-name {
    color: #1a1a1a;
  }

  .date-number {
    font-size: 16px;
    font-weight: 300;
  }

  .active-date-number {
    font-weight: 600;
    color: #1a1a1a;
    width: 28px;
    padding: 0px 0px;
  }

  .habits-area {
    padding: 20px;
    background: #fafafa;
  }

  .icon-habits {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
  }

  .demo-panel {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .feature-explanation {
    max-width: 520px;
    margin: 0 auto;
    padding: 0 0 0 0;
  }

  .feature-explanation p {
    margin: 0;
    font-size: 16px;
    line-height: 1.6;
    color: #374151;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .demo-layout {
      grid-template-columns: 1fr;
      gap: 32px;
    }

    .day-column {
      max-width: 240px;
      margin: 0 auto;
    }

    .demo-hint {
      order: -1;
      margin-bottom: 8px;
    }
  }
</style> 