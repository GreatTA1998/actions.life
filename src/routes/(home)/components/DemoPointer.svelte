<script>
  let { x = 0, y = 0, glide = false, visible = false, pulse = 0, tap = false } = $props()
</script>

<div
  class={[
    'pointer-events-none absolute top-0 left-0 z-30',
    glide && 'transition-transform duration-700 ease-out',
    visible ? 'opacity-100' : 'opacity-0'
  ]}
  style:transform="translate({x}px, {y}px)"
>
  {#if tap}
    {#key pulse}
      {#if pulse}
        <span class="tap"></span>
      {/if}
    {/key}
  {:else}
    <svg class="drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]" width="18" height="18" viewBox="0 0 18 18">
      <path
        d="M2 1.4 L2 14.4 L5.7 11.2 L8.5 16.4 L10.6 15.3 L7.8 10.2 L12.6 9.9 Z"
        fill="white"
        stroke="#1a1a1a"
        stroke-width="1.2"
        stroke-linejoin="round"
      />
    </svg>
    {#key pulse}
      {#if pulse}
        <span class="ring"></span>
      {/if}
    {/key}
  {/if}
</div>

<style>
  .ring {
    position: absolute;
    top: -7px;
    left: -7px;
    width: 16px;
    height: 16px;
    border-radius: 999px;
    border: 2px solid #2757cf;
    animation: pop 0.45s ease-out forwards;
  }

  @keyframes pop {
    from { transform: scale(0.3); opacity: 0.9; }
    to { transform: scale(2.4); opacity: 0; }
  }

  .tap {
    position: absolute;
    width: 34px;
    height: 34px;
    margin-top: -17px;
    margin-left: -17px;
    border-radius: 999px;
    background: rgba(39, 87, 207, 0.38);
    animation: tap 0.55s ease-out forwards;
  }

  @keyframes tap {
    0% { transform: scale(0.35); opacity: 0.95; box-shadow: 0 0 0 0 rgba(39, 87, 207, 0.45); }
    40% { transform: scale(1); opacity: 0.75; box-shadow: 0 0 0 6px rgba(39, 87, 207, 0.15); }
    100% { transform: scale(1.2); opacity: 0; box-shadow: 0 0 0 16px rgba(39, 87, 207, 0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ring, .tap { animation: none; }
  }
</style>
