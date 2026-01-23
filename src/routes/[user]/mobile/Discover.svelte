<script>
  import ScheduleTab from './ScheduleTab.svelte'
  import HabitsTab from './HabitsTab.svelte'
  import PhotoGrid from '../components/Archive/PhotoGrid.svelte'
  import TabButton from './TabButton.svelte'
  import MslCalendarMonthOutline from 'virtual:icons/material-symbols-light/calendar-month-outline'
  import MslRepeat from 'virtual:icons/material-symbols-light/repeat'
  import MslPhotoCameraBackOutline from 'virtual:icons/material-symbols-light/photo-camera-back-outline'

  let activeTab = $state('date') // 'date', 'habits', 'archive', 'photos'
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
    </div>
  </div>

  <div class="tab-content hide-scrollbar">
    {#if activeTab === 'date'}
      <ScheduleTab />
    {:else if activeTab === 'habits'}
      <HabitsTab />
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

