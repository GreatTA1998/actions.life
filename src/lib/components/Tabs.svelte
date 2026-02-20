<script>
  import { createEventDispatcher } from 'svelte'

  export let tabs = []
  export let activeTab = tabs.length > 0 ? tabs[0].value : ''
  
  const dispatch = createEventDispatcher()
  
  function setActiveTab(tab) {
    activeTab = tab
    dispatch('tabChange', { tab })
  }
</script>

<div class="tabs-container">
  <div class="tabs">
    {#each tabs as tab}
      <button 
        class="tab-button {activeTab === tab.value ? 'active' : ''}" 
        on:click={() => setActiveTab(tab.value)}
      >
        {tab.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .tabs-container {
    margin-bottom: 16px;
    width: fit-content;
  }
  
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--faint-color);
  }
  
  .tab-button {
    padding: 8px 16px;
    background-color: transparent;
    font-size: 0.875rem;
    position: relative;
    color: var(--text-muted);
    font-weight: 500;
  }
  
  .tab-button:after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: transparent;
  }
  
  .tab-button.active {
    color: var(--active);
    font-weight: 600;
  }
  
  .tab-button.active:after {
    background-color: var(--active);
  }
</style> 