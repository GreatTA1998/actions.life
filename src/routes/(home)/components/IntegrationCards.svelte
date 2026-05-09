<script>
  import ApplePhotosLogo from './ApplePhotosLogo.svelte'
  import GoogleCalendarLogo from './GoogleCalendarLogo.svelte'
  import NotionLogo from './NotionLogo.svelte'
  import IntegrationCard from './IntegrationCard.svelte'
  import DemoVideo from './DemoVideo.svelte'
  import PortraitVideo from './PortraitVideo.svelte'

  const OPTIONS = {
    APPLE_PHOTOS: 'photo-user',
    GOOGLE_CALENDAR: 'google-calendar-user'
  }

  let audience = $state(OPTIONS.GOOGLE_CALENDAR)
  let player = $state(null)
  let activeTime = $state(1)

  function seek (t, e) {
    e.stopPropagation()
    activeTime = t
    if (!player) return
    player.currentTime = t
    if (player.paused) player.play()
  }
</script>

<div class="flex flex-col items-center gap-x-12 gap-y-4 w-full">
  <div class="flex justify-center items-start gap-x-4 w-8/10">
    <IntegrationCard
      title="Problem"
      points={[
        { t: 32, label: "Important things are often excluded from calendars." },
        // { t: 30, label: "Lists that can be seen together and less fragmented." },
      ]}
      {activeTime}
      onseek={seek}
    >
      <!-- <img src="/logo-no-bg.png" alt="" /> -->
    </IntegrationCard>

    <IntegrationCard
      title="Insight"
      points={[
        { t: 149, label: 'Almost everything important requires us to act.' },
      ]}
      {activeTime}
      onseek={seek}
    >
      <img src="/logo-no-bg.png" class="size-7 object-contain" style:transform="scale(1.0)" />
    </IntegrationCard>

    <IntegrationCard
      title="Demo"
      points={[
        { t: 266, label: 'Basics'},
        { t: 397, label: 'Timelines'},
        { t: 492, label: 'Icon habits and sub-routines' }
      ]}
      {activeTime}
      onseek={seek}
    >
      <img src="/leaf-2-no-bg.avif" class="size-7 object-contain" style:transform="scale(1.4)" />
    </IntegrationCard>

    <IntegrationCard
      title="Ecosystem"
      points={[
        { t: 748, label: 'Designed to complement other tools' }
      ]}
      {activeTime}
      onseek={seek}
    >
      <ApplePhotosLogo />
      <GoogleCalendarLogo />
      <NotionLogo />
    </IntegrationCard>
  </div>

  {#if audience === OPTIONS.APPLE_PHOTOS}
    <PortraitVideo />
  {:else if audience === OPTIONS.GOOGLE_CALENDAR}
    <DemoVideo bind:player />
  {/if}
</div>
