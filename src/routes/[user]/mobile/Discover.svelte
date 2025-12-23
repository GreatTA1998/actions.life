<script>
  import ScheduleTab from './ScheduleTab.svelte'
  import HabitsTab from './HabitsTab.svelte'
  import AI from '../components/AI/AI.svelte'
  import ArchiveTab from './ArchiveTab.svelte'
  import PhotoGrid from '../components/Archive/PhotoGrid.svelte'
  import TabButton from './TabButton.svelte'
  import MslCalendarMonthOutline from 'virtual:icons/material-symbols-light/calendar-month-outline'
  import MslRepeat from 'virtual:icons/material-symbols-light/repeat'
  import MslPhotoCameraBackOutline from 'virtual:icons/material-symbols-light/photo-camera-back-outline'
  import MslArchiveOutline from 'virtual:icons/material-symbols-light/archive-outline'
  import MslSmartToyOutline from 'virtual:icons/material-symbols-light/smart-toy-outline'

  let activeTab = $state('date') // 'date', 'habits', 'ai', 'search', 'archive', 'photos'
</script>

<div class="discover-container">
  <div class="tabs-header">
    <div class="tabs-wrapper">
      <TabButton active={activeTab === 'date'} onclick={() => activeTab = 'date'}>  
        <MslCalendarMonthOutline style="font-size: 1.8rem;"/>
      </TabButton>
      <TabButton active={activeTab === 'habits'} onclick={() => activeTab = 'habits'}>  
        <MslRepeat style="font-size: 1.8rem;"/>
      </TabButton>
      <TabButton active={activeTab === 'photos'} onclick={() => activeTab = 'photos'}>  
        <MslPhotoCameraBackOutline style="font-size: 1.8rem;"/>
      </TabButton>
      <TabButton active={activeTab === 'archive'} onclick={() => activeTab = 'archive'}>  
        <MslArchiveOutline style="font-size: 1.8rem;"/>
      </TabButton>
      <TabButton active={activeTab === 'ai'} onclick={() => activeTab = 'ai'}>  
        <MslSmartToyOutline style="font-size: 1.8rem;"/>
      </TabButton>
    </div>
  </div>

  <div class="tab-content hide-scrollbar">
    {#if activeTab === 'date'}
      <ScheduleTab />
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

