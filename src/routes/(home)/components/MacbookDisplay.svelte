<script>
  let { children } = $props()
</script>

<div class="w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[28px]">
  <div class="bg-black aspect-[16/10] rounded-[28px] p-[12px] shadow-2xl">
    <div class={['h-full bg-white', 'rounded-[16px] overflow-hidden']}>
      {@render children()}
    </div>
  </div>
</div>