<script>
  import DemoContext from './DemoContext.svelte'
  import HeroSection from './components/HeroSection.svelte'
  import TimelineDemo from './components/TimelineDemo.svelte'
  import HabitDemo from './components/HabitDemo.svelte'
  import JournalDemo from './components/JournalDemo.svelte'
  import ComparisonTable from './components/ComparisonTable.svelte'
  import UpdateLogSection from './components/UpdateLogSection.svelte'
  import ArtisticBackground from './components/ArtisticBackground.svelte'
  import TopNavbar from './components/TopNavbar.svelte'
  import TaskPopup from '../[user]/components/TaskPopup/TaskPopup.svelte'
  import SignInButton from '$lib/components/SignInButton.svelte'
  import { authChecked } from '$lib/store'
  // import AppDetailsSection from './components/AppDetailsSection.svelte'
  // import VisionSection from './components/VisionSection.svelte'
</script>

{#if $authChecked}
  <div class="home-bg h-full flex grow" style="padding: 3%; padding-top: 2%;">
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
      </DemoContext>

      <div class="flex flex-col w-full h-[320px] items-center gap-8 justify-start">
        <SignInButton />

        <div style="display: flex; gap: 1.5rem; opacity: 0.6; font-size: 0.8rem;">
          <a href="/legal/privacy-policy" style="text-decoration: none; color: inherit;">
            Privacy Policy
          </a>
          <a href="/legal/terms-of-service" style="text-decoration: none; color: inherit;">
            Terms of Service
          </a>
        </div>
      </div>

        <!-- <TaskPopup /> -->
        <!-- <VisionSection /> -->
        <!-- <AppDetailsSection /> -->
    </div>
  </div>
{/if}

<style lang="scss">
  .home-bg {
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

  .home-bg > * {
    position: relative;
    z-index: 1;
  }
</style>