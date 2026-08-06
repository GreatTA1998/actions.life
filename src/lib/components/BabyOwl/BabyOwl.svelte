<script>
  import { MediaQuery } from 'svelte/reactivity'
  import OwlPocControls from './OwlPocControls.svelte'

  let {
    size = 56,
    /** Navbar edge the owl perches on: 'bottom' | 'right' */
    position = 'right'
  } = $props()

  const uid = $props.id()
  const prefersReduced = new MediaQuery('prefers-reduced-motion: reduce')

  /** Dev override: 'auto' | 'idle' | 'sleep' */
  let pocMood = $state('auto')
  let clockHour = $state(new Date().getHours())
  let nightTime = $derived(clockHour >= 22 || clockHour < 6)
  let mood = $derived(
    pocMood === 'auto'
      ? nightTime
        ? 'sleep'
        : 'idle'
      : pocMood === 'sleep'
        ? 'sleep'
        : 'idle'
  )

  let height = $derived(Math.round(size * (64 / 56)))
  let sleeping = $derived(mood === 'sleep')
  let reducedMotion = $derived(prefersReduced.current)

  /** Subtle yaw degrees — small only, so the face never collapses */
  let headYaw = $state(0)

  $effect(() => {
    const id = setInterval(() => {
      clockHour = new Date().getHours()
    }, 60_000)
    return () => clearInterval(id)
  })

  $effect(() => {
    if (reducedMotion || sleeping) {
      headYaw = 0
      return
    }

    let timer

    function schedule () {
      // rare: every ~12–20s
      const delay = 12000 + Math.random() * 8000
      timer = setTimeout(() => {
        // glance aside, then usually ease back toward center next tick
        const next = headYaw === 0
          ? (Math.random() < 0.5 ? -11 : 11)
          : 0
        headYaw = next
        schedule()
      }, delay)
    }

    schedule()

    return () => clearTimeout(timer)
  })
</script>

<div
  class={[
    'absolute pointer-events-none z-[1] overflow-visible',
    position === 'bottom'
      ? 'bottom-[calc(100%-8px)] left-1'
      : 'top-1 right-[calc(100%-8px)]'
  ]}
>
<div
  class={['baby-owl', sleeping ? 'mood-sleep' : 'mood-idle', { 'reduced-motion': reducedMotion }]}
  style:width="{size}px"
  style:height="{height}px"
  style:--head-yaw="{headYaw}deg"
>
  <svg class="owl-svg" viewBox="0 0 56 64" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="{uid}-head" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stop-color="#C8C2B8" />
        <stop offset="55%" stop-color="#A39B90" />
        <stop offset="100%" stop-color="#7E766C" />
      </radialGradient>
      <radialGradient id="{uid}-body" cx="42%" cy="28%" r="78%">
        <stop offset="0%" stop-color="#9A9186" />
        <stop offset="70%" stop-color="#6F675E" />
        <stop offset="100%" stop-color="#564F48" />
      </radialGradient>
      <radialGradient id="{uid}-disk" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#D8D1C6" />
        <stop offset="100%" stop-color="#B0A89C" />
      </radialGradient>
      <radialGradient id="{uid}-eye" cx="38%" cy="34%" r="62%">
        <stop offset="0%" stop-color="#FFE56A" />
        <stop offset="55%" stop-color="#F2C93A" />
        <stop offset="100%" stop-color="#D4A41A" />
      </radialGradient>
      <radialGradient id="{uid}-lid" cx="50%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#B8B0A4" />
        <stop offset="100%" stop-color="#8A8278" />
      </radialGradient>
      <filter id="{uid}-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.35" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <g class="owl-settle">
      <g class="owl-breathe">
        <!-- body stays put -->
        <ellipse cx="28" cy="46" rx="15.5" ry="13.5" fill="url(#{uid}-head)" filter="url(#{uid}-soft)" />
        <ellipse cx="28" cy="48" rx="13.5" ry="11.5" fill="url(#{uid}-body)" opacity="0.85" />
        <g class="speckles" fill="#E8DFD0" opacity="0.55">
          <ellipse cx="22" cy="44" rx="1.1" ry="0.75" />
          <ellipse cx="26.5" cy="49" rx="0.9" ry="0.65" />
          <ellipse cx="32" cy="45.5" rx="1.15" ry="0.7" />
          <ellipse cx="35.5" cy="50" rx="0.85" ry="0.6" />
          <ellipse cx="24" cy="52" rx="0.75" ry="0.55" />
          <ellipse cx="30" cy="53.5" rx="0.95" ry="0.6" />
          <ellipse cx="19.5" cy="48.5" rx="0.7" ry="0.5" />
        </g>
        <ellipse cx="28" cy="50" rx="8" ry="6.5" fill="#C9C0B4" opacity="0.45" />
        <ellipse cx="23.5" cy="58.5" rx="3.2" ry="1.4" fill="#5A5046" opacity="0.55" />
        <ellipse cx="32.5" cy="58.5" rx="3.2" ry="1.4" fill="#5A5046" opacity="0.55" />

        <!-- head: rare subtle yaw only -->
        <g class="head-yaw">
          <ellipse cx="28" cy="26" rx="20" ry="18.5" fill="url(#{uid}-head)" filter="url(#{uid}-soft)" />
          <ellipse cx="28" cy="28" rx="18" ry="16" fill="url(#{uid}-body)" opacity="0.22" />
          <ellipse cx="19.5" cy="27" rx="10.5" ry="11" fill="url(#{uid}-disk)" opacity="0.92" />
          <ellipse cx="36.5" cy="27" rx="10.5" ry="11" fill="url(#{uid}-disk)" opacity="0.92" />

          <g class="eyes">
            <g class="eye">
              <circle class="glow" cx="19.5" cy="27" r="8.2" fill="#F6D24A" opacity="0.28" />
              <circle class="iris" cx="19.5" cy="27" r="7.2" fill="url(#{uid}-eye)" />
              <circle class="pupil" cx="19.5" cy="27.2" r="3.35" fill="#1A1510" />
              <circle class="highlight" cx="17.6" cy="25.2" r="1.15" fill="#FFF8E0" opacity="0.9" />
              <circle class="lid" cx="19.5" cy="27" r="7.5" fill="url(#{uid}-lid)" />
              <path class="sleep-crease" d="M13.2 27.2 Q19.5 30.6 25.8 27.2" />
            </g>
            <g class="eye">
              <circle class="glow" cx="36.5" cy="27" r="8.2" fill="#F6D24A" opacity="0.28" />
              <circle class="iris" cx="36.5" cy="27" r="7.2" fill="url(#{uid}-eye)" />
              <circle class="pupil" cx="36.5" cy="27.2" r="3.35" fill="#1A1510" />
              <circle class="highlight" cx="34.6" cy="25.2" r="1.15" fill="#FFF8E0" opacity="0.9" />
              <circle class="lid" cx="36.5" cy="27" r="7.5" fill="url(#{uid}-lid)" />
              <path class="sleep-crease" d="M30.2 27.2 Q36.5 30.6 42.8 27.2" />
            </g>
          </g>

          <path
            class="beak"
            d="M28 30.2 C27.1 30.2 26.2 31.1 26 32.2 C25.8 33.4 26.6 34.6 28 35.4 C29.4 34.6 30.2 33.4 30 32.2 C29.8 31.1 28.9 30.2 28 30.2 Z"
            fill="#2A2218"
          />
          <path
            d="M28 31.1 C27.4 31.2 26.9 31.8 26.8 32.5 C27.4 33.6 28 34.2 28 34.2 C28 34.2 28.6 33.6 29.2 32.5 C29.1 31.8 28.6 31.2 28 31.1 Z"
            fill="#3D3226"
            opacity="0.55"
          />
        </g>
      </g>

      <g class="zzz">
        <text x="40" y="14" font-size="11" font-family="Georgia, serif" font-style="italic" fill="#A89888">z</text>
        <text x="48" y="6" font-size="9.5" font-family="Georgia, serif" font-style="italic" fill="#A89888">z</text>
        <text x="55" y="-1" font-size="8" font-family="Georgia, serif" font-style="italic" fill="#A89888">z</text>
      </g>
    </g>
  </svg>
</div>

{#if import.meta.env.DEV}
  <OwlPocControls bind:mood={pocMood} />
{/if}
</div>

<style>
  .baby-owl {
    --head-yaw: 0deg;
    display: block;
    line-height: 0;
    pointer-events: none;
    user-select: none;
    perspective: 220px;
    perspective-origin: 50% 40%;
  }

  .owl-svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .owl-settle {
    transform-origin: 28px 58px;
    transform: translateY(0);
    transition: transform 1.2s ease;
  }

  .owl-breathe {
    transform-origin: 28px 50px;
    animation: breathe-idle 4s ease-in-out infinite;
  }

  /* subtle yaw around vertical axis — body stays still */
  .head-yaw {
    transform-origin: 28px 28px;
    transform-box: view-box;
    transform: rotateY(var(--head-yaw));
    transition: transform 1.8s cubic-bezier(0.4, 0.1, 0.2, 1);
  }

  .lid {
    transform-box: fill-box;
    transform-origin: 50% 0%;
    transform: scaleY(0);
    transition: transform 0.7s ease;
  }

  .pupil,
  .highlight,
  .iris,
  .glow {
    transition: opacity 0.7s ease;
  }

  .sleep-crease {
    fill: none;
    stroke: #7A7268;
    stroke-width: 1.1;
    stroke-linecap: round;
    opacity: 0;
    transition: opacity 0.8s ease;
  }

  .zzz {
    opacity: 0;
  }

  .mood-idle .lid {
    transform: scaleY(0);
  }

  .mood-sleep .owl-settle {
    transform: translateY(3px);
  }

  .mood-sleep .owl-breathe {
    animation: breathe-sleep 5.2s ease-in-out infinite;
  }

  .mood-sleep .head-yaw {
    transform: rotateY(0deg);
    transition: transform 1.4s ease;
  }

  .mood-sleep .lid {
    transform: scaleY(1);
  }

  .mood-sleep .glow,
  .mood-sleep .iris,
  .mood-sleep .pupil,
  .mood-sleep .highlight {
    opacity: 0;
  }

  .mood-sleep .sleep-crease {
    opacity: 0.55;
  }

  .mood-sleep .zzz {
    animation: zzz-drift 4.2s ease-in-out infinite;
  }

  .reduced-motion .owl-breathe,
  .reduced-motion .zzz {
    animation: none !important;
  }

  .reduced-motion .head-yaw,
  .reduced-motion .owl-settle,
  .reduced-motion .lid {
    transition: none !important;
  }

  @keyframes breathe-idle {
    0%,
    100% {
      transform: scale(1, 1);
    }
    50% {
      transform: scale(1.012, 0.992);
    }
  }

  @keyframes breathe-sleep {
    0%,
    100% {
      transform: scale(1, 1);
    }
    50% {
      transform: scale(1.03, 0.975);
    }
  }

  @keyframes zzz-drift {
    0%,
    100% {
      opacity: 0.35;
      transform: translateY(0);
    }
    50% {
      opacity: 0.85;
      transform: translateY(-3px);
    }
  }
</style>
