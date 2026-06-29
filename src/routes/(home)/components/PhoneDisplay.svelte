<script>
  let { children } = $props()

  const iphone_16_aspect_ratio = 'aspect-[9/19.5]'
</script>

<div class="w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[34px]">
  <div class="{iphone_16_aspect_ratio} rounded-[34px] overflow-hidden outline outline-[6px] outline-black shadow-2xl">
    {@render children()}
  </div>
</div>
