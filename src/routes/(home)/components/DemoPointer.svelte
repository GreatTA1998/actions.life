<script>
  import finger from './finger-drawing.png'

  let { x = 0, y = 0, glide = false, visible = false, pulse = 0, tap = false } = $props()

  let slot = $state(null)

  $effect(() => {
    if (!pulse || !slot) return
    slot.animate(
      [
        { transform: 'translateY(0)', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        { transform: 'translateY(2.5px)', offset: 0.38 },
        { transform: 'translateY(2.5px)', offset: 0.58, easing: 'cubic-bezier(0.33, 0, 0.2, 1)' },
        { transform: 'translateY(0)' }
      ],
      { duration: 380 }
    )
  })
</script>

<div
  class={[
    'pointer-events-none absolute top-0 left-0 z-30',
    glide && (tap
      ? 'transition-transform duration-500 ease-in'
      : 'transition-transform duration-700 ease-out'),
    !tap && (visible ? 'opacity-100' : 'opacity-0')
  ]}
  style:transform="translate({x}px, {y}px)"
>
  {#if tap}
    <div class={['hand', visible ? 'opacity-100' : 'opacity-0']}>
      <div bind:this={slot}>
        <img class="finger" src={finger} alt="" />
      </div>
    </div>
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
  .hand {
    transition: opacity 180ms ease;
  }

  /* Appear at the spot it left. Fade only on the way out. */
  .hand.opacity-100 {
    transition: none;
  }

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

  .finger {
    display: block;
    width: 200px;
    height: auto;
    margin-top: -20px;
    margin-left: -25px;
    filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.18));
  }

  .tap {
    position: absolute;
    z-index: 1;
    width: 22px;
    height: 22px;
    margin-top: -11px;
    margin-left: -11px;
    border: 1px solid rgba(39, 87, 207, 0.45);
    border-radius: 999px;
    background: rgba(39, 87, 207, 0.08);
    animation: tap 0.55s cubic-bezier(0.22, 0.6, 0.36, 1) forwards;
  }

  @keyframes tap {
    0% { transform: scale(0.5); opacity: 0; }
    35% { opacity: 0.8; }
    100% { transform: scale(1.65); opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ring, .tap { animation: none; }
  }
</style>
