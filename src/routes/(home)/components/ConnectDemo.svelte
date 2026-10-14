<script>
  import GoogleLogo from '$lib/components/GoogleLogo.svelte'
  import Slider from '$lib/components/Slider.svelte'
  import { themes } from '$lib/store/themes'
  import DemoCard from './DemoCard.svelte'

  let { title = '' } = $props()
</script>

<DemoCard ratio={9 / 16} minRatio={0.92} theme="google" align="end" {title}>
  <div class="absolute inset-0 flex flex-col items-start gap-5 bg-[var(--cal-bg)] px-3.5 py-4">
    <div>
      <p class="label">Google Calendar</p>
      <div class="connect">
        <span class="logo"><GoogleLogo /></span>
        <span>Connecting...</span>
      </div>
    </div>

    <div class="w-full">
      <p class="label">Font size</p>
      <div class="flex w-full items-center gap-2 text-neutral-600">
        <span class="text-[0.7rem] leading-none">A</span>
        <div class="font-slider min-w-0 flex-1">
          <Slider value={2} min={0} max={4} ticks={5} class="w-full" />
        </div>
        <span class="text-[0.95rem] leading-none">A</span>
      </div>
    </div>

    <div>
      <p class="label">Theme</p>
      <div class="flex items-center gap-2">
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
      <div class="export">Export data</div>
      <p class="hint">MCP server coming soon</p>
    </div>
  </div>
</DemoCard>

<style>
  .label {
    margin: 0 0 0.35rem;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.2;
    color: #404040;
  }

  .hint {
    margin: 0.4rem 0 0;
    font-size: 0.7rem;
    line-height: 1.3;
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
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding: 0 12px 0 10px;
    border: 1px solid #dadce0;
    border-radius: 4px;
    background: #fff;
    color: #3c4043;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .logo {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }
</style>
