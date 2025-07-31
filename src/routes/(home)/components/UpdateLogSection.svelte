<script>
  import UpdateLogContext from './UpdateLogContext.svelte'
  import UpdateLogTimelineAndPopup from './UpdateLogTimelineAndPopup.svelte'
</script>

 <!-- This will re-use the task popup. It's a creative way to write a lot more in depth about actions.life, the insights used, and the design philosophy.
    At the bottom, include the call to action AND the Github codebase. You never know, accumulating stars is never a bad thing. -->
<div class="updates-section">
  <div class="section-header">
    <h2>History of Updates</h2>
  </div>

  <UpdateLogContext>
    <UpdateLogTimelineAndPopup />
  </UpdateLogContext>
</div>

<style>
  .updates-section {
    max-width: 1200px;
    margin: 80px auto;
    padding: 48px 24px;
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

  @media (max-width: 768px) {
    .section-header h2 {
      font-size: 28px;
    }
  }
</style> 