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
          { t: 87, label: "Any task can become a list" },
        ]}
        t={87}
        active={isChapterActive(87)}
        {onseek}
      />

      <IntegrationCard
        title="Integrated timelines"
        points={[
          { t: 102, label: 'See long-term priorities every day'}
        ]}
        active={isChapterActive(102)}
        {onseek}
        t={102}
      />

      <IntegrationCard
        title="Icon habits"
        points={[
          { t: 127, label: 'Display reminders efficiently' },
        ]}
        active={isChapterActive(127)}
        {onseek}
        t={127}
      />

      <IntegrationCard
        title="Photos"
        points={[
          { t: 154, label: "Write about special memories" },
        ]}
        active={isChapterActive(154)}
        {onseek}
        t={154}
      />
    </div>
  </aside>

  <MuxPlayer bind:el={player}
    thumbnailTime={323}
    playbackID="52G2LWUlR1t00OuzxkJ6oTmTP2I3bQMPIVCCC8AjSi4o"
    aspectRatio={1896/1080}
  />
</div>
