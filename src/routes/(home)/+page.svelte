<script>
  import UserAppInstance from '$lib/components/UserAppInstance.svelte'
  import FeatureCards from './components/FeatureCards.svelte'
  import AnonymousContext from './AnonymousContext.svelte'
  import MacbookDisplay from './components/MacbookDisplay.svelte'
  import PhoneDisplay from './components/PhoneDisplay.svelte'
  import Footer from './components/Footer.svelte'
  import OutboundLinks from './components/OutboundLinks.svelte'
  import GoogleLoginButton from './components/GoogleLoginButton.svelte'
  import LoadingLogo from '$lib/components/LoadingLogo.svelte'
  import { authChecked, authUser, initialDataReady } from '$lib/store'
  import { fade } from 'svelte/transition'
  import { isMobile } from '$lib/utils/core.js'
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'
  import { startHomeRecorder } from '$lib/features/rrweb/homeRecorder.js'

  let browserSupported = $state(true)
  let seedDataCallback = $state(null)

  onMount(() => {
    browserSupported = HTMLElement.prototype.hasOwnProperty("popover")
      && CSS.supports('anchor-name: --x')
    return startHomeRecorder()
  })

  function handleSeedDataReady(seedTasks) {
    // Pass seed data to UserAppInstance via callback
    if (seedDataCallback) {
      seedDataCallback(seedTasks)
    }
  }
</script>

<div class="relative min-h-screen">

  <div class="relative z-1 mx-auto flex flex-col px-[clamp(1.25rem,5vw,4rem)]">
    <div class="flex flex-col items-center pt-[8rem] text-center">
      <h1 class="text-balance text-[clamp(2.4rem,1.25rem+1.7vw,3.75rem)] font-semibold leading-[1.15] tracking-tight text-gray-600">
        actions.life is a hierarchical planner
      </h1>
      <p class="mt-4 mb-0 max-w-[56ch] text-pretty text-lg leading-[1.45] text-gray-500">
        Put everything you want to track on one page, so nothing gets lost.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <GoogleLoginButton />
        <OutboundLinks />
      </div>
    </div>

    <div class="mx-auto mt-16 w-8/10 max-md:mt-12 max-md:w-[min(88vw,320px)]">
      {#if !browserSupported}
        <p class="mb-4 text-[0.9375rem] text-amber-700">
          WARNING: some features may not work on your browser. Please use the latest Chrome or Safari.
        </p>
      {/if}

      {#if browser && isMobile()}
        <PhoneDisplay children={simulatedApp} />
      {:else}
        <MacbookDisplay children={simulatedApp} />
      {/if}
    </div>

    <div class="mt-28">
      <FeatureCards />
    </div>

    {#snippet simulatedApp ()}
      <div class="relative size-full">
        {#if $authChecked && !$authUser?.email}
          <AnonymousContext onSeedDataReady={handleSeedDataReady}>
            {#snippet children (uid)}
              {#if uid}
                <UserAppInstance {uid} bind:onSeedDataReady={seedDataCallback} />
              {/if}
            {/snippet}
          </AnonymousContext>
        {/if}

        {#if !$initialDataReady}
          <div transition:fade class="absolute inset-0 z-10 bg-[var(--offwhite-bg)]"></div>
        {/if}
        {#if !$initialDataReady}
          <LoadingLogo />
        {/if}
      </div>
    {/snippet}

    <Footer />
  </div>
</div>
