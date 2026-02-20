<script>
  import MslCasinoOutline from 'virtual:icons/material-symbols-light/casino-outline'

  let { active = false, onclick } = $props()
  let isSpinning = $state(false)

  function handleClick () {
    isSpinning = true
    setTimeout(() => isSpinning = false, 500)
    onclick?.()
  }
</script>

<button 
  class="random-button" 
  class:active
  class:spinning={isSpinning}
  onclick={handleClick}
  title="Show random photos"
>
  <MslCasinoOutline style="font-size: 1.375rem"/>
</button>

<style>
  .random-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background-color: var(--surface-2);
    color: var(--text-muted);
    opacity: 0.7;
    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
    transform-origin: center;
  }

  .random-button:hover {
    opacity: 1;
    background-color: var(--surface-3);
    transform: rotate(15deg) scale(1.05);
    box-shadow: 0 2px 4px rgba(0,0,0,0.12);
    color: var(--text-secondary);
  }
  
  .random-button.spinning {
    animation: spin-bounce 0.5s ease-out;
  }
  
  @keyframes spin-bounce {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.15); }
    100% { transform: rotate(360deg) scale(1); }
  }

  .random-button.active {
    background-color: var(--surface-4);
    color: var(--primary-color);
    opacity: 1;
    transform: rotate(0deg) scale(1);
    box-shadow: 0 2px 4px rgba(0,123,255,0.2);
  }
</style>
