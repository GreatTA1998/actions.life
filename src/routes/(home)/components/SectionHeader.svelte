<script>
  let { title, subtitle } = $props()
</script>

<header>
  <h2 class="m-0 uppercase font-semibold tracking-[-0.02em] text-[clamp(1.125rem,1.5vw,1.375rem)] text-gray-600">
    {title}
  </h2>
  {#if subtitle}
    <p class="mt-1.5 max-w-[55ch] leading-[1.6] text-sm text-gray-600">
      {subtitle}
    </p>
  {/if}
</header>
