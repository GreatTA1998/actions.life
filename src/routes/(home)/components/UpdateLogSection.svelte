<script>
  import UpdateLogContext from './UpdateLogContext.svelte'
  import UpdateLogTimelineAndPopup from './UpdateLogTimelineAndPopup.svelte'
  import { writable } from 'svelte/store'
  import { DateTime } from 'luxon'

  // Create reactive stores for side panel state
  let selectedUpdate = null

  // Mock dependencies for our components
  const mockTaskService = {
    update: ({ id, keyValueChanges }) => {
      console.log('Demo: Would update task', id, 'with', keyValueChanges)
    }
  }
</script>

<div class="updates-section">
  <div class="section-header">
    <h2>Past Updates</h2>
    
    This will re-use the task popup. It's a creative way to write a lot more in depth about actions.life, the insights used, and the design philosophy.
    At the bottom, include the call to action AND the Github codebase. You never know, accumulating stars is never a bad thing.
  </div>

  <div class="interactive-timeline">
    <UpdateLogContext>
      <UpdateLogTimelineAndPopup />
    </UpdateLogContext>
  </div>
</div>

<style>
  .updates-section {
    max-width: 1200px;
    margin: 80px auto;
    padding: 0 24px;
  }

  .section-header {
    margin-bottom: 56px;
  }

  .section-header h2 {
    margin: 0 0 12px 0;
    font-size: 32px;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.02em;
  }

  .interactive-timeline {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 48px;
    margin-bottom: 56px;
    min-height: 600px;
  }

  /* Mobile responsive */
  @media (max-width: 1024px) {
    .interactive-timeline {
      grid-template-columns: 1fr;
      gap: 32px;
    }
  }

  @media (max-width: 768px) {
    .section-header h2 {
      font-size: 28px;
    }
  }
</style> 