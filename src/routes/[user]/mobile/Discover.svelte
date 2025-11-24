<script>
  import DateTab from './DateTab.svelte'
  import HabitsTab from './HabitsTab.svelte'
  import AI from '../components/AI/AI.svelte'
  import ArchiveTab from './ArchiveTab.svelte'
  import PhotoGrid from '../components/Archive/PhotoGrid.svelte'
  import TabButton from './TabButton.svelte'

  let activeTab = $state('date') // 'date', 'habits', 'ai', 'search', 'archive', 'photos'
</script>

<div class="discover-container">
  <div class="tabs-header">
    <div class="tabs-wrapper">
      <TabButton 
        icon="calendar_month"
        active={activeTab === 'date'}
        onclick={() => activeTab = 'date'}
      />
      <TabButton 
        icon="repeat"
        active={activeTab === 'habits'}
        onclick={() => activeTab = 'habits'}
      />
      <TabButton 
        icon="photo_library"
        active={activeTab === 'photos'}
        onclick={() => activeTab = 'photos'}
      />
      <TabButton 
        icon="archive"
        active={activeTab === 'archive'}
        onclick={() => activeTab = 'archive'}
      />
      <TabButton 
        icon="smart_toy"
        active={activeTab === 'ai'}
        onclick={() => activeTab = 'ai'}
      />
    </div>
  </div>

  <div class="tab-content hide-scrollbar">
    {#if activeTab === 'date'}
      <DateTab />
    {:else if activeTab === 'habits'}
      <HabitsTab />
    {:else if activeTab === 'ai'}
      <div style="height: 100%;">
        <AI />
      </div>
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
    padding: 4px 8px;
    background: transparent;
    position: sticky;
    top: 0;
    z-index: 5;
  }

  .tabs-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
  }

  .tabs-wrapper::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 1px;
    background: #e0e0e0;
  }

  .tab-content {
    flex: 1;
    overflow-y: auto;
  }
</style>

