<script>
  import IntegrationCard from './IntegrationCard.svelte'
  import MuxPlayer from './MuxPlayer.svelte'
  import { onMount } from 'svelte'

  const CHAPTER_WINDOW = 15

  let player = $state(null)
  let currentTime = $state(0)

  onMount(() => {
    const ontimeupdate = () => { currentTime = player.currentTime }
    player.addEventListener('timeupdate', ontimeupdate)
    return () => player.removeEventListener('timeupdate', ontimeupdate)
  })

  function isChapterActive (t) {
    return currentTime >= t && currentTime < t + CHAPTER_WINDOW
  }

  function onseek (t, e) {
    e.stopPropagation()
    if (!player) return
    player.currentTime = t
    currentTime = t
    if (player.paused) player.play()
  }
</script>

<div class="flex w-full flex-col gap-4 md:flex-row md:items-start">
  <aside class="relative flex flex-col gap-2.5 md:basis-[min(280px,32%)] md:shrink-0">
    <div class="flex flex-col gap-1.5 md:gap-2.5">
      <IntegrationCard
        title="Natural hierarchy"
        points={[
          { t: 98, label: "Any task can become a list" },
        ]}
        t={98}
        active={isChapterActive(98)}
        {onseek}
      />

      <IntegrationCard
        title="Icon habits"
        points={[
          { t: 153, label: 'Display reminders efficiently' },
        ]}
        active={isChapterActive(153)}
        {onseek}
        t={153}
      />

      <IntegrationCard
        title="Integrated timelines"
        points={[
          { t: 191, label: 'See long-term priorities every day'}
        ]}
        active={isChapterActive(191)}
        {onseek}
        t={191}
      />

      <IntegrationCard
        title="Photos"
        points={[
          { t: 248, label: "Write about special memories" },
        ]}
        active={isChapterActive(248)}
        {onseek}
        t={248}
      />
    </div>
  </aside>

  <MuxPlayer bind:el={player}
    thumbnailTime={323}
    playbackID="0082oMnMQmCHidjKdIviqG01pCWr7QU1xZhzdiGPHxRTY"
    aspectRatio={1896/1080}
  />
</div>
