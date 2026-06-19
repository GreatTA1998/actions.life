<script>
  import IntegrationCard from './IntegrationCard.svelte'
  import MuxPlayer from './MuxPlayer.svelte'

  let player = $state(null)
  let activeTime = $state(1)
  let isPlaying = $state(false)

  $effect(() => {
    if (player) isPlaying = !player.paused
  })

  function onseek (t, e) {
    e.stopPropagation()
    activeTime = t
    if (!player) return
    player.currentTime = t
    if (player.paused) player.play()
  }
</script>

<div class="flex flex-col items-center w-full">
  <div class="w-9/10 md:w-8/10 relative">
    <div class="absolute top-[2%] left-[1%] w-fit flex flex-col gap-1 md:gap-2.5 z-10 pointer-events-none
      {isPlaying ? 'opacity-0 [&>*]:pointer-events-none' : 'opacity-100 [&>*]:pointer-events-auto'}"
    >
      <IntegrationCard
        title="Natural hierarchy"
        points={[
          { t: 56, label: "Any task can become a list" },
        ]}
        t={56}
        {activeTime}
        {onseek}
      />

      <IntegrationCard
        title="Icon habits"
        points={[
          { t: 102, label: 'Display reminders efficiently' },
        ]}
        {activeTime}
        {onseek}
        t={102}
      />

      <IntegrationCard
        title="Integrated timelines"
        points={[
          { t: 161, label: 'See long-term priorities every day'}
        ]}
        {activeTime}
        {onseek}
        t={161}
      />

      <IntegrationCard
        title="Captioned photos"
        points={[
          { t: 187, label: "Write about special memories" },
        ]}
        {activeTime}
        {onseek}
        t={187}
      />
    </div>

    <MuxPlayer bind:el={player} 
      onplay={() => isPlaying = true}
      onpause={() => isPlaying = false}
      thumbnailTime={234}
      playbackID="fIdCROW8GN00FnyhmwPx9jYIasj8NltltGXL00TLtH4q8"
      aspectRatio={1816/1080}
    />
  </div>
</div>
