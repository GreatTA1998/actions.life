<script>
  import { isMobile } from '$lib/utils/core.js'

  let {
    src,
    poster = undefined,
    transcript = []
  } = $props()

  let videoEl = $state(null)
  let scrollEl = $state(null)
  let currentTime = $state(0)
  let showTranscript = $state(true)

  let activeIdx = $derived.by(() => {
    if (!transcript.length) return -1
    const next = transcript.findIndex(c => c.t > currentTime)
    return next === -1 ? transcript.length - 1 : Math.max(0, next - 1)
  })

  $effect(() => {
    if (activeIdx < 0 || !scrollEl) return
    const el = scrollEl.children[activeIdx]
    if (!el) return
    const top = el.offsetTop - scrollEl.clientHeight / 2 + el.clientHeight / 2
    scrollEl.scrollTo({ top, behavior: 'smooth' })
  })

  function seek (t, e) {
    e.stopPropagation()
    videoEl.currentTime = t
    if (videoEl.paused) videoEl.play()
  }

  function timestamp (seconds) {
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60 
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  }
</script>

<!-- TO-DO
  aspect ratio, ffmpeg faster load, optimized file, separate mobile 
-->
<div class={['w-9/10 relative']}>
  <div class={['w-full aspect-video']}>
    <video
      bind:this={videoEl}
      {src}
      {poster}
      class={['block w-full rounded-2xl']}
      playsinline
      onplay={() => {
        showTranscript = false;
        isPlaying = true;
      }}
      onpause={() => {
        showTranscript = true;
        isPlaying = false;
      }}
      ontimeupdate={() => currentTime = videoEl.currentTime}
      controls
    ></video>
  </div>
   
  {#if transcript.length && showTranscript && !isMobile()}
    <div
      class={[
        'w-[260px] rounded-xl overflow-hidden',
        'absolute bottom-24 right-4 bg-black/40 pt-2 pb-2 px-2'
      ]}
    >
      <div bind:this={scrollEl} class="overflow-y-auto p-2 space-y-2">
        {#each transcript as cue, i (i)}
          <button
            onclick={e => seek(cue.t, e)}
            class={[
              'text-white',
              'block w-full text-left text-sm leading-relaxed'
            ]}
          >
            <div class="flex gap-x-2 font-medium text-md">
              <span class="text-[hsl(210_100%_88%)]">
                {timestamp(cue.t)}
              </span>
              <span>
                {cue.title}
              </span>
            </div>
            <div class="font-normal">
              {cue.text} 
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>