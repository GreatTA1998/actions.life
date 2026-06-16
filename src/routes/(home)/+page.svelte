<script>
  import UserAppInstance from '$lib/components/UserAppInstance.svelte'
  import ArtisticBackground from './components/ArtisticBackground.svelte'
  import IntegrationCards from './components/CardsAndVideo.svelte'
  import AnonymousContext from './AnonymousContext.svelte'
  import MacbookDisplay from './components/MacbookDisplay.svelte'
  import PhoneDisplay from './components/PhoneDisplay.svelte'
  import SignInCard from './components/SignInCard.svelte'
  import { authChecked, authUser } from '$lib/store'
  import { isMobile } from '$lib/utils/core.js'
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'

  let browserSupported = $state(true)

  onMount(() => {
    browserSupported = HTMLElement.prototype.hasOwnProperty("popover")
      && CSS.supports('anchor-name: --x')
  })
</script>

<div class="home-bg h-full flex grow" style:padding-top="2%">

  <ArtisticBackground />

  <div class="basis-full flex flex-col items-center mt-[60px] gap-x-12 gap-y-20">
    <div class="h-[30vh] flex flex-col items-center justify-center text-center px-4 gap-4">
      <div class="mx-auto py-32 sm:py-48 lg:py-56">
        <div class="text-center">
          <h1 class="text-5xl font-semibold tracking-tight text-balance text-gray-500 sm:text-7xl">
            actions.life
          </h1>
          <p class="mt-4 max-w-[60ch] text-pretty text-gray-600 md:text-3xl sm:text-xl/8">
            List and calendar on one page
          </p>
        </div>
      </div>
    </div>

    <IntegrationCards />

    {#if !browserSupported}
      <p class="text-center text-amber-700 px-4 max-w-[60ch]">
        WARNING: some features may not work on your browser. Please use the latest Chrome or Safari.
      </p>
    {/if}

    {#if browser && isMobile()}
      <PhoneDisplay children={simulatedApp} />
    {:else}
      <MacbookDisplay children={simulatedApp} />
    {/if}

    {#snippet simulatedApp ()}
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
    {/snippet}

    <SignInCard />

    <footer class="w-full mt-40 py-8 flex justify-end mr-10 gap-6 text-xs text-neutral-400 tracking-tight">
      <a href="/auth/privacy" class="no-underline">Privacy</a>
      <a href="/auth/terms" class="no-underline">Terms</a>
    </footer>
  </div>
</div>
