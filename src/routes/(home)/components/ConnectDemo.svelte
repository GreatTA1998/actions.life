<script>
  import { onMount } from 'svelte'
  import GoogleLogo from '$lib/components/GoogleLogo.svelte'
  import Slider from '$lib/components/Slider.svelte'
  import { themes } from '$lib/store/themes'
  import DemoCard from './DemoCard.svelte'
  import { elementRef, setMotionPaused } from './demoLoop.js'

  let { title = '', platform = '', Icon = null } = $props()

  let stage = $state(null)
  const stageRef = elementRef((node) => { stage = node })

  let playing = $state(true)
  let canToggle = $state(false)

  onMount(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    canToggle = !reduced
  })

  function toggle () {
    playing = !playing
    setMotionPaused(stage, !playing)
  }
</script>

<DemoCard ratio={9 / 16} minRatio={0.92} theme="google" {title} {platform} {Icon} ontoggle={canToggle ? toggle : undefined}>
  <div {@attach stageRef} class="absolute inset-0 flex flex-col items-start gap-2.5 bg-[var(--cal-bg)] px-3 pt-2.5">
    <div>
      <p class="label">Google Calendar</p>
      <div class="connect">
        <span class="logo"><GoogleLogo /></span>
        <span>Connecting<span class="dots"><i></i><i></i><i></i></span></span>
      </div>
    </div>

    <div class="w-full">
      <p class="label">Font size</p>
      <div class="flex w-full items-center gap-1.5 text-neutral-600">
        <span class="text-[0.7rem] leading-none">A</span>
        <div class="font-slider min-w-0 flex-1">
          <Slider value={2} min={0} max={4} ticks={5} class="w-full" />
        </div>
        <span class="text-[0.95rem] leading-none">A</span>
      </div>
    </div>

    <div>
      <p class="label">Theme</p>
      <div class="flex items-center gap-1.5">
        {#each Object.entries(themes) as [name, colors] (name)}
          <span
            class={['swatch', name === 'google' && 'picked']}
            style:background-color={colors.previewColor}
          ></span>
        {/each}
        <span class="swatch art"></span>
      </div>
      <p class="hint">Artist collaboration themes coming soon</p>
    </div>

    <div>
      <p class="label">Export data</p>
      <div class="export">Export</div>
      <p class="hint">MCP server coming soon</p>
    </div>

  </div>
</DemoCard>

<style>
  .label {
    margin: 0 0 0.15rem;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.2;
    color: #404040;
  }

  .hint {
    margin: 0.2rem 0 0;
    font-size: 0.7rem;
    line-height: 1.2;
    color: #737373;
  }

  .swatch {
    width: 1.35rem;
    height: 1.35rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.4rem;
  }

  .swatch.picked {
    box-shadow: 0 0 0 1.5px #3c4043;
  }

  .swatch.art {
    border-style: dashed;
    background:
      repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(0, 0, 0, 0.06) 2px, rgba(0, 0, 0, 0.06) 3px);
  }

  .export {
    display: inline-flex;
    align-items: center;
    height: 26px;
    padding: 0 10px;
    border: 1px solid #dadce0;
    border-radius: 4px;
    background: #fff;
    color: #3c4043;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .font-slider :global(.root) {
    --thumb-size: 0.75rem;
  }

  .connect {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding: 0 14px 0 10px;
    border: 1px solid #dadce0;
    border-radius: 4px;
    background: #fff;
    color: #3c4043;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .dots {
    display: inline-flex;
    align-items: center;
    gap: 0.1em;
    width: 0.85em;
    margin-left: 0.15em;
  }

  .dots i {
    display: block;
    width: 0.16em;
    height: 0.16em;
    border-radius: 999px;
    background: currentColor;
    opacity: 0.25;
    animation: dot 1.2s ease-in-out infinite;
  }

  .dots i:nth-child(2) { animation-delay: 0.2s; }
  .dots i:nth-child(3) { animation-delay: 0.4s; }

  @keyframes dot {
    0%, 100% { opacity: 0.25; }
    40% { opacity: 1; }
  }

  .logo {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }

  @media (prefers-reduced-motion: reduce) {
    .dots i { animation: none; opacity: 1; }
  }
</style>
