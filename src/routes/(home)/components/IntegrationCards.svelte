<script>
  import ApplePhotosLogo from './ApplePhotosLogo.svelte'
  import GoogleCalendarLogo from './GoogleCalendarLogo.svelte'
  import DemoVideo from './DemoVideo.svelte'
  import PortraitVideo from './PortraitVideo.svelte'

  const OPTIONS = {
    APPLE_PHOTOS: 'photo-user',
    GOOGLE_CALENDAR: 'google-calendar-user'
  }

  let audience = $state(OPTIONS.GOOGLE_CALENDAR)
  let player = $state(null)

  function seek (t, e) {
    e.stopPropagation()
    player.currentTime = t
    if (player.paused) player.play()
  }

  function timestamp (seconds) {
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60 
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  }
</script>

<div class="flex flex-col items-center gap-x-12 gap-y-4 w-full">
  <div class="flex justify-center gap-x-4 w-8/10 px-6">
    {@render card(TwigLogo, 0, 'Basics', 'Put to-do lists anywhere on the calendar')}
    {@render card(TwigLogoWithLeaf, 62, 'Advanced', 'Introduces timelines, sub-routines and icon habits')}
    {@render card(PhotosLogo, 316, 'Photos', 'Organize photos around calendar events, with captions')}
    {@render card(GCalLogo, 396, 'Integrations', 'Display events from multiple Google accounts')}
  </div>

  {#if audience === OPTIONS.APPLE_PHOTOS}
    <PortraitVideo />
  {:else if audience === OPTIONS.GOOGLE_CALENDAR}
    <DemoVideo bind:player />
  {/if}
</div>

{#snippet TwigLogo ()}
  <img src="/logo-no-bg.png" class="size-[28px]" />
{/snippet}

{#snippet TwigLogoWithLeaf ()}
  <img src="/leaf-2-no-bg.avif" class="size-[40px]" />
{/snippet}

{#snippet GCalLogo ()}
  <GoogleCalendarLogo/>
{/snippet}

{#snippet PhotosLogo ()}
  <ApplePhotosLogo/>
{/snippet}

{#snippet card (logoSnippet, s, title, description)}
  <div 
    onclick={(e) => seek(s, e)}
    class="rounded-xl w-[360px] pt-1 pb-2 px-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] bg-white"
  >
    <div class="flex items-center gap-x-2">
      <div>
        {@render logoSnippet()}
      </div>  
      <p class="font-bold text-neutral-700">{title}</p>
    </div>
    <div class="text-neutral-600 text-sm">{description}
      <span class="text-xs">
        (<span style:color="#065fd4">{timestamp(s)}</span>)
      </span>
    </div>
  </div>
{/snippet}