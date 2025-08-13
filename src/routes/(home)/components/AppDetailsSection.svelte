<script>
  // No script needed for this static content component
</script>

<div class="details-section">
  <div class="section-header">
    <h2>Current limitations</h2>
  </div>

  <div class="linear-limitations-list">
    <div class="linear-limitation-row">
      <span class="linear-limitation-title">No calendar sharing (try TimeTree)</span>
      <span class="linear-limitation-desc"></span>
      <span class="linear-alt-icons">
        <span title="TimeTree" class="alt-app-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><g><ellipse cx="14.0001" cy="21.0001" rx="2.33333" ry="2.33333" fill="#4ECB71"/><ellipse cx="7.00008" cy="17.3333" rx="2.33333" ry="2.33333" fill="#4ECB71"/><ellipse cx="21.0001" cy="17.3333" rx="2.33333" ry="2.33333" fill="#4ECB71"/><ellipse cx="10.3334" cy="11.6667" rx="2.33333" ry="2.33333" fill="#4ECB71"/><ellipse cx="17.6667" cy="11.6667" rx="2.33333" ry="2.33333" fill="#4ECB71"/></g></svg>
        </span>
      </span>
    </div>
    <div class="linear-limitation-row">
      <span class="linear-limitation-title">No integrations & notifications (try Vim/Notion/Google/Apple calendar)</span>
      <span class="linear-limitation-desc"></span>
      <span class="linear-alt-icons">
        <span title="Notion" class="alt-app-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="3" width="22" height="22" rx="5" fill="#fff" stroke="#222" stroke-width="2"/><path d="M9.5 9.5h9v9h-9z" fill="#fff"/><path d="M10.5 10.5h7v7h-7z" stroke="#222" stroke-width="1.5"/><text x="12.5" y="19" font-size="8" font-family="Arial" fill="#222">N</text></svg>
        </span>
        <span title="Google Calendar" class="alt-app-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="3" width="22" height="22" rx="5" fill="#fff" stroke="#222" stroke-width="2"/><rect x="8" y="8" width="12" height="12" rx="2" fill="#4285F4"/><text x="13.5" y="19" font-size="8" font-family="Arial" fill="#fff">G</text></svg>
        </span>
      </span>
    </div>
  </div>
</div>

<style>
  .details-section {
    max-width: 480px;
    margin: 80px auto;
    padding: 0 24px;
  }
  .section-header {
    margin-bottom: 32px;
    text-align: left;
  }
  .section-header h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.02em;
  }
  .linear-limitations-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .linear-limitation-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--offwhite-bg);
    border: 1px solid #ececec;
    border-radius: 8px;
    padding: 16px 20px;
    font-size: 16px;
    font-weight: 400;
    color: #222;
    gap: 16px;
  }
  .linear-limitation-title {
    font-weight: 600;
    color: #1a1a1a;
    min-width: 120px;
  }
  .linear-limitation-desc {
    color: #6b7280;
    font-size: 15px;
    flex: 1;
    text-align: right;
  }
  .linear-alt-icons {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-left: 16px;
  }
  .alt-app-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: #f8f8f8;
    border: 1px solid #ececec;
    transition: box-shadow 0.15s;
  }
  .alt-app-icon:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
</style> 