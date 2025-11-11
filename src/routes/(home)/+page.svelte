<script>
  import DemoContext from './DemoContext.svelte'
  import { hasFetchedUser } from '$lib/store'
  import HeroSection from './components/HeroSection.svelte'
  import TimelineDemo from './components/TimelineDemo.svelte'
  import HabitDemo from './components/HabitDemo.svelte'
  import JournalDemo from './components/JournalDemo.svelte'
  import ComparisonTable from './components/ComparisonTable.svelte'
  import UpdateLogSection from './components/UpdateLogSection.svelte'
  import ArtisticBackground from './components/ArtisticBackground.svelte'
  import TopNavbar from './components/TopNavbar.svelte'
  import TaskPopup from '../[user]/components/TaskPopup/TaskPopup.svelte'
  import LoginGoogle from '$lib/components/LoginGoogle.svelte'
  // import AppDetailsSection from './components/AppDetailsSection.svelte'
  // import VisionSection from './components/VisionSection.svelte'
</script>

{#if $hasFetchedUser}
  <div
    style="display: flex; flex-grow: 1; height: 100%; padding: 3%; padding-top: 2%;"
    class="home-page-background"
  >
    <div style="position: absolute; top: 0; left: 0; right: 0;">
      <TopNavbar />
    </div>

    <ArtisticBackground />
    
    <div style="width: 100%; min-width: 200px; border-radius: 10px; margin-top: 60px; display: flex; flex-direction: column; gap: 120px;">
      <DemoContext>
        <HeroSection />

        <TimelineDemo />

        <HabitDemo />

        <JournalDemo />

        <ComparisonTable />

        <UpdateLogSection />

        <div style="display: flex; width: 100%; height: 320px; justify-content: center; align-items: start">
          <LoginGoogle />
        </div>

        <TaskPopup />
        <!-- <VisionSection /> -->
        <!-- <AppDetailsSection /> -->
      </DemoContext>
    </div>
  </div>
{/if}

<style lang="scss">
  .home-page-background {
    background: linear-gradient(
      135deg,
      #f7f0e1 0%,
      #e8f4f0 25%,
      #d4e8e0 50%,
      #c8dcd2 75%,
      #bfd3c7 100%
    );
    position: relative;
    overflow-x: hidden;
  }

  .home-page-background > * {
    position: relative;
    z-index: 1;
  }
</style>