<script>
  import ArtisticBackground from './components/ArtisticBackground.svelte'
  import UserAppInstance from '$lib/components/UserAppInstance.svelte'
  import DemoVideo from './components/DemoVideo.svelte'
  import AnonymousContext from './AnonymousContext.svelte'
  import SectionHeader from './components/SectionHeader.svelte'
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


<div class="relative min-h-screen">
  <ArtisticBackground />

  <div class="relative z-1 flex flex-col mx-auto px-[clamp(1rem,5vw,4rem)]">
    <div class="mt-40 mb-30">
      <div class="grid grid-cols-4 gap-y-[clamp(1.5rem,2vw,3rem)] max-[900px]:grid-cols-1">
        <h1 class="col-span-full text-left font-semibold tracking-tight leading-[1.4] text-[clamp(2.4rem,1.25rem+1.7vw,3.75rem)] text-gray-600">
          actions.life is a one page life calendar
        </h1>
        <div class="col-span-3 max-w-[52ch] text-pretty text-md leading-[1.6] text-gray-600 max-[900px]:col-span-1">
          Combine the to-do list and calendar.
          Focus deeply on one thing without the fear of neglecting other things.
          Adjust future plans with drag-and-drop and log past memories with photos. 
          Be reminded of small habits and long-term dreams in the same place.
        </div>
      </div>
    </div>

    <div class="my-20 flex flex-col gap-y-4">
      <SectionHeader
        title="Demo video"
        subtitle="Skip to any section with chapter cards"
      />
      <DemoVideo />
    </div>

    <div class="my-20 mx-auto flex w-8/10 max-md:w-[min(88vw,320px)] flex-col gap-6">
      <SectionHeader
        title="Playground"
        subtitle="No login required"
      />

      <div class="flex flex-col gap-8 pb-8">
        {#if !browserSupported}
          <p class="text-amber-700 text-[0.9375rem]">
            WARNING: some features may not work on your browser. Please use the latest Chrome or Safari.
          </p>
        {/if}

        {#if browser && isMobile()}
          <PhoneDisplay children={simulatedApp} />
        {:else}
          <MacbookDisplay children={simulatedApp} />
        {/if}
      </div>
    </div>

    <div class="flex items-center justify-center mt-12 mb-54">
      <SignInCard/>
    </div>

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
  </div>
</div>
