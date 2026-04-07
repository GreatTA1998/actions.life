<script>
  import MslPlayArrow from 'virtual:icons/material-symbols-light/play-arrow'

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

<div class="relative" onclick={togglePlay}>
  <video 
    bind:this={videoEl}
    src="https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/homePageDemoVideos%2F2026-timeline-demo-for-notion-user.webm?alt=media&token=d7bbfaa3-b2a9-4a3e-8cea-2e81e687a2fb"
    class="w-full h-auto block rounded-2xl"
    playsinline
  >
  </video>

  {#if !isPlaying}
    <div class="absolute bottom-6 left-6 flex items-center gap-3 text-white">
      <div class="bg-white/20 backdrop-blur-md rounded-full p-2 flex items-center justify-center ring-1 ring-white/30">
        <MslPlayArrow class="text-3xl" />
      </div>
    </div>
  {/if}
</div>