<script>
  import DateTab from './DateTab.svelte'
  import HabitsTab from './HabitsTab.svelte'
  import AI from '../components/AI/AI.svelte'
  import SearchTab from './SearchTab.svelte'
  import ArchiveTab from './ArchiveTab.svelte'
  import PhotoGrid from '../components/Archive/PhotoGrid.svelte'

  let activeTab = 'date' // 'date', 'habits', 'ai', 'search', 'archive', 'photos'
</script>

<div class="discover-container">
  <div class="tabs-header">
    <div class="tabs-wrapper">
      <button 
        class="tab-button" 
        class:active={activeTab === 'date'}
        onclick={() => activeTab = 'date'}
      >
        <span class="material-symbols-outlined">calendar_month</span>

      </button>
      <button 
        class="tab-button" 
        class:active={activeTab === 'habits'}
        onclick={() => activeTab = 'habits'}
      >
        <span class="material-symbols-outlined">repeat</span>

      </button>

      <button 
        class="tab-button" 
        class:active={activeTab === 'photos'}
        onclick={() => activeTab = 'photos'}
      >
        <span class="material-symbols-outlined">photo_library</span>
      </button>

      <button 
        class="tab-button" 
        class:active={activeTab === 'ai'}
        onclick={() => activeTab = 'ai'}
      >
        <span class="material-symbols-outlined">smart_toy</span>
      </button>
      <button 
        class="tab-button" 
        class:active={activeTab === 'search'}
        onclick={() => activeTab = 'search'}
      >
        <span class="material-symbols-outlined">search</span>
      </button>
      <button 
        class="tab-button" 
        class:active={activeTab === 'archive'}
        onclick={() => activeTab = 'archive'}
      >
        <span class="material-symbols-outlined">archive</span>
      </button>
    </div>
  </div>

  <div class="tab-content">
    {#if activeTab === 'date'}
      <DateTab />
    {:else if activeTab === 'habits'}
      <HabitsTab />
    {:else if activeTab === 'ai'}
      <div style="height: 100%;">
        <AI />
      </div>
    {:else if activeTab === 'search'}
      <SearchTab />
    {:else if activeTab === 'archive'}
      <ArchiveTab />
    {:else if activeTab === 'photos'}
      <PhotoGrid />
    {/if}
  </div>
</div>

<style>
  .discover-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .tabs-header {
    padding: 12px 16px 8px 16px;
    background: transparent;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .tabs-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
  }

  .tabs-wrapper::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    right: 0;
    height: 1px;
    background: #e0e0e0;
  }

  .tab-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #666;
    font-size: 12px;
    transition: all 0.2s;
    position: relative;
  }

  .tab-button.active {
    color: var(--logo-twig-color, #b34f1b);
  }

  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--logo-twig-color, #b34f1b);
    border-radius: 1px;
    z-index: 1;
  }

  .tab-button .material-symbols-outlined {
    font-size: 24px;
  }

  .tab-content {
    flex: 1;
    overflow-y: auto;
    /* Hide scrollbar for Firefox */
    scrollbar-width: none;
    /* Hide scrollbar for IE and Edge */
    -ms-overflow-style: none;
  }

  /* Hide scrollbar for Chrome, Safari and Opera */
  .tab-content::-webkit-scrollbar {
    display: none;
  }
</style>

