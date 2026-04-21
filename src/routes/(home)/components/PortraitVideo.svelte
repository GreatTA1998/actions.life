<script>
  let { src, title } = $props()
  let playing = $state(false)
</script>

<div class="relative w-[280px] aspect-[9/19.5] rounded-2xl overflow-hidden">
  <video {src} playsinline controls
    onplay={() => (playing = true)}
    onpause={() => (playing = false)}
    class="h-full object-cover"
  ></video>
  {#if !playing}
    <div class="absolute bottom-16 rounded text-sm px-4.5 text-white pointer-events-none">
      <div class="font-medium">{title}</div>
    </div>
  {/if}
</div>