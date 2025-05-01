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
  /* note this overrides other components' --active color */
  :root {
    --active: rgb(0, 89, 125); /* used to be rgb(0, 89, 125) */
  }

  .tabs-container {
    margin-bottom: 16px;
    width: fit-content;
  }
  
  .tabs {
    display: flex;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .tab-button {
    padding: 8px 16px;
    border: none;
    background-color: transparent;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    position: relative;
    color: #666;
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
    transition: background-color 0.2s;
  }
  
  .tab-button.active {
    color: var(--active);
    font-weight: 600;
  }
  
  .tab-button.active:after {
    background-color: var(--active);
  }
</style> 