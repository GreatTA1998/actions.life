<script>
  let { children } = $props()

  const iphone_16_aspect_ratio = 'aspect-[9/19.5]'
</script>

<div class="w-[min(88vw,320px)] mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
  <div class="{iphone_16_aspect_ratio} bg-black rounded-[40px] p-[6px] shadow-2xl">
    <div class={['h-full bg-white', 'rounded-[34px] overflow-hidden']}>
      {@render children()}
    </div>
  </div>
</div>
