<script>
  let { activator, customActions } = $props()

  let popover = $state(null)
  let loading = $state(false)
  let timeoutID = $state('')

  function open () {
    popover.showPopover()
  }

  function close ({ timeout = 0 }) {
    // arrow function needed because this context would be lost in `setTimeout` otherwise
    timeoutID = setTimeout(() => {
      popover.hidePopover()
    }, 
    timeout)
  }
  
  function setLoading (newVal) {
    loading = newVal
  }
</script>

{@render activator({ open, close, setLoading })}

<!-- hover should delay the autoclose -->
<!-- warning, MUST NOT USE DISPLAY FLEX BECAUSE POPOVER USES DISPLAY NONE TO HIDE ITS STATE -->
<div popover="manual" bind:this={popover} 
  style="position: fixed; top: auto; right: auto; bottom: 12px; left: 50%; transform: translateX(-50%); width: max-content; max-width: calc(100vw - 24px); margin: 0;"
  class="snackbar-stylistic"
  class:loading={loading}
>
  <div style="status">
    {@render customActions({ open, close, setLoading })}
  </div>
</div>

<style>
  .snackbar-stylistic {
    background: rgba(0, 0, 0, 0.85);
    padding: 14px 20px;
    border-radius: 8px;
    min-width: 280px;
    transition: box-shadow 300ms ease;
    position: relative;
    box-sizing: border-box; /* avoid layout shift when border color changes */
    border: 1px solid transparent; /* constant border to avoid reflow */
    /* subtle always-on edge for a premium look */
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset;
  }

  /* Simple, modern pulsing border glow (outside only) */
  .loading {
    /* single, attached glow from the box edge */
    --glow: 0, 229, 255; /* cyan with more pop */
    box-shadow:
      0 0 0 2px rgba(var(--glow), 0.60),  /* crisp ring hugging the edge */
      0 0 24px rgba(var(--glow), 0.45),   /* mid glow */
      0 0 56px rgba(var(--glow), 0.30);   /* far glow */
    animation: subtle-pulse 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  @keyframes subtle-pulse {
    0%, 100% {
      box-shadow:
        0 0 0 2px rgba(var(--glow), 0.60),
        0 0 24px rgba(var(--glow), 0.45),
        0 0 56px rgba(var(--glow), 0.30);
    }
    50% {
      box-shadow:
        0 0 0 3px rgba(var(--glow), 0.85),
        0 0 34px rgba(var(--glow), 0.60),
        0 0 72px rgba(var(--glow), 0.40);
    }
  }
</style>