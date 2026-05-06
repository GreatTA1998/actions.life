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
      title="Motivation"
      points={[
        { t: 20, label: 'A calendar that is long-term oriented and aspirational.' },
        // { t: 30, label: "Lists that can be seen together and less fragmented." },
      ]}
      {activeTime}
      onseek={seek}
    >
      <!-- <img src="/logo-no-bg.png" alt="" /> -->
    </IntegrationCard>

    <IntegrationCard
      title="Basics"
      points={[
        { t: 110, label: 'One page only' },
        { t: 170, label: 'Minimize concepts' },
        { t: 190, label: 'Tasks and sub-tasks enable lists and timelines.'}
      ]}
      {activeTime}
      onseek={seek}
    >
      <img src="/logo-no-bg.png" style:transform="scale(1.0)" />
    </IntegrationCard>

    <IntegrationCard
      title="Advanced"
      points={[
        { t: 396, label: 'Icon habits and sub-routines' },
        { t: 490, label: 'Review time-spent, and past notes' }
      ]}
      {activeTime}
      onseek={seek}
    >
      <img src="/leaf-2-no-bg.avif" style:transform="scale(1.4)" />
    </IntegrationCard>

    <IntegrationCard
      title="Ecosystem"
      points={[
        { t: 316, label: 'Meaningful system for photos' },
        { t: 350, label: 'Google Calendar integration' },
        { t: 380, label: 'Pairs well with Notion & Linear' }
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
