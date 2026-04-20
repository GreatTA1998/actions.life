<script>
  import MslPlayArrow from 'virtual:icons/material-symbols-light/play-arrow'

  let {
    src,
    orientation = 'horizontal',
    poster = undefined
  } = $props()

  let videoEl = $state(null)
  let isPlaying = $state(false)

  function togglePlay () {
    if (videoEl.paused) {
      videoEl.play()
      isPlaying = true
    } else {
      videoEl.pause()
      isPlaying = false
    }
  }
</script>

<div
  class={[
    'relative',
    orientation === 'vertical'
      ? 'w-[min(80vw,300px)] mx-auto aspect-[9/19.5]'
      : 'w-full aspect-video'
  ]}
  onclick={togglePlay}
>
  <video
    bind:this={videoEl}
    {src}
    {poster}
    class={[
      'block w-full rounded-2xl',
      orientation === 'vertical' && 'h-full object-cover'
    ]}
    playsinline
    onplay={() => isPlaying = true}
    onpause={() => isPlaying = false}
  ></video>

  {#if !isPlaying}
    <div class="absolute bottom-6 left-6 flex items-center gap-3 text-white">
      <div class="bg-white/20 backdrop-blur-md rounded-full p-2 flex items-center justify-center ring-1 ring-white/30">
        <MslPlayArrow class="text-3xl" />
      </div>
    </div>
  {/if}
</div>