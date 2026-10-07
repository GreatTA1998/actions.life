<script>
  import { themes } from '$lib/store/themes'

  let { ratio = 1, minRatio = 0, ontoggle, title = '', platform = '', Icon = null, theme = 'mutedEarth', children } = $props()

  const cssVars = $derived(themes[theme]?.cssVars ?? themes.mutedEarth.cssVars)
</script>

<div class="demo-card flex flex-col select-none" style:--ratio={ratio} style:--min-ratio={minRatio}>
  {#if title}
    <p class={['m-0 pb-3 text-base font-medium leading-snug tracking-[-0.02em] text-neutral-900', minRatio > ratio && 'text-center']}>{title}</p>
  {/if}
  <div
    class="stage relative min-h-0 overflow-hidden rounded-2xl bg-[var(--todo-list-bg-color)]"
    style:--todo-list-bg-color={cssVars['--todo-list-bg-color']}
    style:--cal-bg={cssVars['--cal-bg']}
    style:--grid-color={cssVars['--grid-color']}
    style:--navbar-bg-color={cssVars['--navbar-bg-color']}
  >
    {@render children()}
  {#if ontoggle}
    <button
      type="button"
      onclick={() => ontoggle?.()}
      class="absolute inset-0 z-40 cursor-pointer border-0 bg-transparent p-0"
    ></button>
  {/if}
  {#if platform && Icon}
    <span class="pointer-events-none absolute right-2 bottom-2 z-50 inline-flex items-center gap-1.5 rounded-full bg-[#595959]/80 px-2 py-1 text-[11px] leading-none font-medium tracking-[-0.01em] text-white">
      <Icon class="size-3.5 shrink-0" />
      {platform}
    </span>
  {/if}
  </div>
</div>

<style>
  .demo-card {
    --max-h: 28rem;
    width: min(calc(100vw - 2 * clamp(1rem, 5vw, 4rem)), calc(var(--max-h) * max(var(--ratio), var(--min-ratio, 0))));
    flex-shrink: 0;
  }

  .stage {
    width: min(100%, calc(var(--max-h) * var(--ratio)));
    aspect-ratio: var(--ratio);
    margin-inline: auto;
  }

  @media (min-width: 768px) {
    .demo-card {
      --max-h: min(22rem, 26vw);
    }

    .demo-card:first-child .stage { margin-left: 0; }
    .demo-card:last-child .stage { margin-left: auto; margin-right: 0; }
    .demo-card:first-child p { text-align: start; }
    .demo-card:last-child p { text-align: end; }
  }
</style>
