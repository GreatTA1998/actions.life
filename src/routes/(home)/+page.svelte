<script>
  import DemoContext from './DemoContext.svelte'
  import HeroSection from './components/HeroSection.svelte'
  import TimelineDemo from './components/TimelineDemo.svelte'
  import HabitDemo from './components/HabitDemo.svelte'
  import JournalDemo from './components/JournalDemo.svelte'
  import ComparisonTable from './components/ComparisonTable.svelte'
  import UpdateLogSection from './components/UpdateLogSection.svelte'
  import ArtisticBackground from './components/ArtisticBackground.svelte'
  import TaskPopup from '../[user]/components/TaskPopup/TaskPopup.svelte'
  import SignInButton from '$lib/components/SignInButton.svelte'
  import IntegrationCards from './components/IntegrationCards.svelte'
  import AnonymousContext from './AnonymousContext.svelte'
  import MacbookDisplay from './components/MacbookDisplay.svelte'
  import LogosChrome from 'virtual:icons/logos/chrome'
  import LogosSafari from 'virtual:icons/logos/safari'
  import { authChecked } from '$lib/store'
  // import AppDetailsSection from './components/AppDetailsSection.svelte'

  let demoActive = $state(false)
</script>

{#if $authChecked}
    <div class="home-bg h-full flex grow" style="padding-top: 2%;">

    <ArtisticBackground />
    
    <div class="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>
    
    <div style="flex-basis: 100%; min-width: 200px; border-radius: 10px; margin-top: 60px; display: flex; flex-direction: column; gap: 48px; align-items: center;">
        <div class="h-[30vh] flex flex-col items-center justify-center text-center px-4 gap-4">
          <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div class="text-center">
              <h1 class="text-5xl font-semibold tracking-tight text-balance text-gray-500 sm:text-7xl">
                actions.life
              </h1>
              <p class="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
                A life calendar for habits, goals and memories
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6"></div>
      
        <IntegrationCards />
        <!-- MacBook Skeleton -->
        <MacbookDisplay>
          {#if !demoActive}
            <div class="flex flex-col items-center justify-center gap-12 h-full">
              <button onclick={() => demoActive = true}
                class="text-[#8e4526] font-semibold text-5xl tracking-tight hover:opacity-80 transition-opacity"
              >
                Try demo
              </button>
              
              <div class="flex items-center gap-16">
                <div class="flex items-center justify-center w-20 h-20">
                  <LogosChrome class="w-[4.4rem] h-[4.4rem] drop-shadow-sm transition-transform hover:scale-105" />
                </div>
                <div class="flex items-center justify-center w-20 h-20">
                  <LogosSafari class="w-20 h-20 drop-shadow-sm transition-transform hover:scale-105" />
                </div>
              </div>
            </div>
          {:else}
            <div class="w-full h-full relative">
              <AnonymousContext/>
            </div>
          {/if}
        </MacbookDisplay>

        <div class="flex flex-col w-full items-center gap-8 justify-start">
          <SignInButton />

          <div style="display: flex; gap: 1.5rem; opacity: 0.4; font-size: 0.8rem; color: white;">
            <a href="/legal/privacy-policy" style="text-decoration: none; color: inherit;">
              Privacy Policy
            </a>
            <a href="/legal/terms-of-service" style="text-decoration: none; color: inherit;">
              Terms of Service
            </a>
          </div>
        </div>

          <!-- <TaskPopup /> -->
          <!-- <AppDetailsSection /> -->
      </div>
    </div>
{/if}

<style lang="scss">
  .home-bg {
    position: relative;
    overflow-x: hidden;
  }

  .home-bg > * {
    position: relative;
    z-index: 1;
  }
</style>