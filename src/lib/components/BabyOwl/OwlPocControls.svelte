<script>
  let {
    mood = $bindable('auto')
  } = $props()

  const modes = [
    { id: 'auto', label: 'Auto' },
    { id: 'idle', label: 'Awake' },
    { id: 'sleep', label: 'Sleep' }
  ]

  const darkModes = [
    { id: false, label: 'Off' },
    { id: true, label: 'On' }
  ]

  let darkModeOn = $state(false)

  /** Escape navbar transform so `position: fixed` is viewport-relative */
  function portal (node) {
    document.body.appendChild(node)
    return () => node.remove()
  }

  $effect(() => {
    const root = document.documentElement
    root.classList.toggle('dark-mode-poc', darkModeOn)
    return () => root.classList.remove('dark-mode-poc')
  })
</script>

<div class="owl-poc" {@attach portal}>
  <div class="header">
    <span class="title">Dev POC</span>
    <span class="note">temp · chrome-style remap</span>
  </div>

  <div class="section-label">Owl</div>
  <div class="modes">
    {#each modes as mode (mode.id)}
      <button
        type="button"
        class={['chip', { active: mood === mode.id }]}
        onclick={() => (mood = mode.id)}
      >
        {mode.label}
      </button>
    {/each}
  </div>

  <div class="section-label">Dark Mode</div>
  <div class="modes">
    {#each darkModes as mode (mode.label)}
      <button
        type="button"
        class={['chip', { active: darkModeOn === mode.id }]}
        onclick={() => (darkModeOn = mode.id)}
      >
        {mode.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .owl-poc {
    position: fixed;
    bottom: 72px;
    left: 12px;
    z-index: 100;
    width: min(200px, calc(100vw - 24px));
    padding: 10px 10px 12px;
    border-radius: 12px;
    background: rgba(40, 36, 32, 0.72);
    border: 1px solid rgba(255, 248, 235, 0.18);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
    backdrop-filter: blur(10px);
    color: #F4E8D4;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 12px;
    line-height: 1.3;
  }

  .header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 8px;
  }

  .title {
    font-weight: 650;
    font-size: 12px;
    letter-spacing: 0.02em;
  }

  .note {
    font-size: 10px;
    opacity: 0.55;
  }

  .section-label {
    font-size: 10px;
    opacity: 0.55;
    margin-bottom: 4px;
  }

  .section-label + .modes {
    margin-bottom: 10px;
  }

  .section-label + .modes:last-child {
    margin-bottom: 0;
  }

  .modes {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .chip {
    appearance: none;
    border: 1px solid rgba(255, 248, 235, 0.16);
    background: rgba(255, 248, 235, 0.08);
    color: inherit;
    border-radius: 999px;
    padding: 4px 8px;
    font-size: 11px;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .chip:hover {
    background: rgba(255, 248, 235, 0.16);
  }

  .chip.active {
    background: rgba(232, 196, 138, 0.35);
    border-color: rgba(232, 196, 138, 0.55);
    color: #FFF8EC;
  }
</style>
