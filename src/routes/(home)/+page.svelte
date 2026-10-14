<script>
  import UserAppInstance from '$lib/components/UserAppInstance.svelte'
  import FeatureCards from './components/FeatureCards.svelte'
  import AnonymousContext from './AnonymousContext.svelte'
  import MacbookDisplay from './components/MacbookDisplay.svelte'
  import PhoneDisplay from './components/PhoneDisplay.svelte'
  import Footer from './components/Footer.svelte'
  import GoogleLoginButton from './components/GoogleLoginButton.svelte'
  import { authChecked, authUser, initialDataReady } from '$lib/store'
  import { fade } from 'svelte/transition'
  import { isMobile } from '$lib/utils/core.js'
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'
  import { startHomeRecorder } from '$lib/features/rrweb/homeRecorder.js'

  let browserSupported = $state(true)

  onMount(() => {
    browserSupported = HTMLElement.prototype.hasOwnProperty("popover")
      && CSS.supports('anchor-name: --x')
    return startHomeRecorder()
  })
</script>

<div class="relative flex min-h-screen flex-col">

  <div class="relative z-1 mx-auto flex w-full flex-col px-[clamp(1.25rem,5vw,2.5rem)]">
    <div class="flex flex-col items-center pt-[8rem] text-center">
      <h1 class="text-balance text-[clamp(2.4rem,1.25rem+1.7vw,3.75rem)] font-semibold leading-[1.15] tracking-tight text-gray-600">
        The zone of reliable execution
      </h1>
      <p class="mt-4 mb-0 max-w-[56ch] text-pretty text-lg leading-[1.45] text-gray-500">
        actions.life is a calendar that centralizes your reminders, events and projects on one page
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <GoogleLoginButton />
      </div>
    </div>

    <div class="mx-auto mt-12 w-full">
      {#if !browserSupported}
        <p class="mb-4 text-[0.9375rem] text-amber-700">
          WARNING: Unsupported browser. Please use the latest Chrome or Safari (iOS 26 or newer).
        </p>
      {/if}

      {#if browser && isMobile()}
        <PhoneDisplay children={simulatedApp} />
      {:else}
        <MacbookDisplay children={simulatedApp} />
      {/if}
    </div>

    <div class="mx-auto mt-28 flex w-max max-w-full min-w-0 flex-col">
      <FeatureCards />
    </div>

    {#snippet simulatedApp ()}
      <div class="relative size-full">
        {#if $authChecked && !$authUser?.email}
          <AnonymousContext>
            {#snippet children (uid)}
              {#if uid}
                <UserAppInstance {uid} />
              {/if}
            {/snippet}
          </AnonymousContext>
        {/if}

        {#if !$initialDataReady}
          <div transition:fade class="absolute inset-0 z-10 grid place-items-center bg-[var(--offwhite-bg)]">
            <span class="text-lg text-neutral-600">Loading demo account...</span>
          </div>
        {/if}
      </div>
    {/snippet}
  </div>

  <Footer />
</div>
