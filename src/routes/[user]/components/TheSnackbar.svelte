{#if $snackbarState.isVisible}
  <div class="snack-wrap">
    <div 
      class="snackbar"
      on:mouseenter={() => clearTimeout(timeoutId)} 
      on:mouseleave={() => {
        timeoutId = setTimeout(() => {
          snackbarState.update(s => ({ ...s, isVisible: false }))
        }, SNACKBAR_DURATION)
      }}
    >
      <span class="message">{$snackbarState.message}</span>

      {#if $snackbarState.undoAction}
        <button on:click={handleUndo} class="undo-button">
          Undo
        </button>
      {/if}
    </div>
  </div>
{/if}

<script>
  import { snackbarState, hideSnackbar, SNACKBAR_DURATION } from '$lib/store'
  let timeoutId

  function handleUndo() {
    if ($snackbarState.undoAction) {
      $snackbarState.undoAction()
      hideSnackbar()
    }
  }
</script>

<style>
  .snack-wrap {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
  }

  .snackbar {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 14px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    backdrop-filter: blur(8px);
    min-width: 250px;
    animation: fade-in 0.2s ease-out;
  }

  .message {
    font-weight: 500;
  }

  .undo-button {
    background: transparent;
    color: #4A9EFF;
    border: none;
    padding: 4px 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-left: auto;
    font-size: 14px;
  }

  .undo-button:hover {
    color: #7AB7FF;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>