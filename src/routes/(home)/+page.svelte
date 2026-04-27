<script>
  import UserAppInstance from '$lib/components/UserAppInstance.svelte'
  import ArtisticBackground from './components/ArtisticBackground.svelte'
  import IntegrationCards from './components/IntegrationCards.svelte'
  import AnonymousContext from './AnonymousContext.svelte'
  import MacbookDisplay from './components/MacbookDisplay.svelte'
  import PhoneDisplay from './components/PhoneDisplay.svelte'
  import AuthPlayground from './components/AuthPlayground.svelte'
  import LogosChrome from 'virtual:icons/logos/chrome'
  import LogosSafari from 'virtual:icons/logos/safari'
  import { authChecked, authUser } from '$lib/store'
  import { isMobile } from '$lib/utils/core.js'
  import { browser } from '$app/environment'
</script>

<div class="home-bg h-full flex grow" style:padding-top="2%">

  <ArtisticBackground />

  <div style="flex-basis: 100%; min-width: 200px; border-radius: 10px; margin-top: 60px; display: flex; flex-direction: column; gap: 48px; align-items: center;">
    <div class="h-[30vh] flex flex-col items-center justify-center text-center px-4 gap-4">
      <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div class="text-center">
          <h1 class="text-5xl font-semibold tracking-tight text-balance text-gray-600 sm:text-7xl">
            actions.life
          </h1>
          <p class="mt-8 text-lg font-medium text-pretty text-gray-600 sm:text-xl/8">
            A life calendar for habits, goals and memories
          </p>
        </div>
      </div>
    </div>

    <div class="mt-6"></div>
  
    <IntegrationCards />

    {#if browser && isMobile()}
      <PhoneDisplay children={simulatedApp} />
    {:else}
      <MacbookDisplay children={simulatedApp} />
    {/if}
    
    {#snippet simulatedApp ()}
      {#if browser && HTMLElement.prototype.hasOwnProperty("popover")}
        <div class="w-full h-full relative">
          {#if $authChecked && !$authUser?.email}
            <AnonymousContext>
              {#snippet children (uid)}
                {#if uid}
                  <UserAppInstance {uid} />
                {/if}
              {/snippet}
            </AnonymousContext>
          {/if}
        </div>
      {:else}
        <div class="relative w-full h-full bg-white flex flex-col items-center justify-center">
          <p>WARNING: the app can't run on your browser and requires the latest version of Chrome or Safari</p>
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center size-12">
              <LogosChrome class="w-[4.4rem] h-[4.4rem] drop-shadow-sm" />
            </div>
            <div class="flex items-center justify-center size-13">
              <LogosSafari class="w-20 h-20 drop-shadow-sm" />
            </div>
          </div>
        </div>
      {/if}
    {/snippet}

    <div class="mt-6"></div>

    <AuthPlayground/>

    <footer class="w-full mt-40 py-8 flex justify-end mr-10 gap-6 text-xs text-neutral-400 tracking-tight">
      <a href="/legal/privacy-policy" class="no-underline">Privacy</a>
      <a href="/legal/terms-of-service" class="no-underline">Terms</a>
    </footer>
  </div>
</div>