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
    <div class="absolute top-[2%] left-[1%] w-[36%] flex flex-col gap-1 md:gap-2.5 z-10 pointer-events-none
      {isPlaying ? 'opacity-0 [&>*]:pointer-events-none' : 'opacity-100 [&>*]:pointer-events-auto'}"
    >
      <IntegrationCard
        title="One page only"
        points={[
          { t: 32, label: "So it's harder to lose track of things" },
        ]}
        t={32}
        {activeTime}
        {onseek}
      />

      <IntegrationCard
        title="Compact habits"
        points={[
          { t: 149, label: 'Put helpful reminders without cluttering the screen' },
        ]}
        {activeTime}
        {onseek}
        t={149}
      />

      <IntegrationCard
        title="Visual timelines"
        points={[
          { t: 266, label: 'Keep perspective on long-term things alongside the day-to-day'}
        ]}
        {activeTime}
        {onseek}
        t={266}
      />

      <IntegrationCard
        title="Captioned photos"
        points={[
          { t: 32, label: "Write notes directly on important memories" },
        ]}
        {activeTime}
        {onseek}
        t={400}
      />
    </div>

    <MuxPlayer bind:el={player} 
      onplay={() => isPlaying = true}
      onpause={() => isPlaying = false}
      thumbnailTime={489}
      playbackID="MEMiWk4a1RIjjveNPPOUeap9A00U00q7lCDRmpJn2RZ1A"
      aspectRatio={15.3/9}
    />
  </div>
</div>
