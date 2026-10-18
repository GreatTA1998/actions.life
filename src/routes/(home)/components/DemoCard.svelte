<script>
  import { themes } from '$lib/store/themes'

  let { ratio = 1, minRatio = 0, ontoggle, title = '', theme = 'mutedEarth', clip = true, align = '', showReplay = false, onreplay, children, hand } = $props()

  const cssVars = $derived(themes[theme]?.cssVars ?? themes.mutedEarth.cssVars)
</script>

<div class={['demo-card flex flex-col select-none', align === 'start' && 'start', align === 'end' && 'end']} style:--ratio={ratio} style:--min-ratio={minRatio}>
  {#if title}
    <p class={['m-0 pb-3 text-lg font-medium leading-snug tracking-[-0.02em] text-neutral-900', minRatio > ratio && 'text-center']}>{title}</p>
  {/if}
  <div class="stage-col relative">
    <div
      class={['stage relative min-h-0 rounded-2xl bg-[var(--todo-list-bg-color)]', clip ? 'overflow-hidden' : 'overflow-visible']}
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
    {#if onreplay}
      <button
        type="button"
        onclick={() => onreplay()}
        class={[
        'absolute inset-0 z-50 flex items-center justify-center border-0 bg-black/10 p-0',
        'transition-opacity duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
        showReplay ? 'cursor-pointer opacity-100' : 'pointer-events-none opacity-0'
      ]}
    >
      <span class="grid size-11 place-items-center rounded-full bg-white/80 text-neutral-900 backdrop-blur-[0px]">
        <svg class="size-7" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
        </svg>
      </span>
      </button>
    {/if}
    </div>
    {#if hand}
      <div class="pointer-events-none absolute inset-0 z-30 overflow-visible">
        {@render hand()}
      </div>
    {/if}
  </div>
</div>

<style>
  .demo-card {
    --max-h: 28rem;
    width: min(calc(100vw - 2 * clamp(1rem, 5vw, 4rem)), calc(var(--max-h) * max(var(--ratio), var(--min-ratio, 0))));
    max-width: 100%;
    flex-shrink: 0;
  }

  .stage-col {
    width: min(100%, calc(var(--max-h) * var(--ratio)));
    margin-inline: auto;
  }

  .stage {
    width: 100%;
    aspect-ratio: var(--ratio);
  }

  @media (min-width: 768px) {
    .demo-card {
      --max-h: 22rem;
      flex-shrink: 1;
    }

    /* Scale with the card so a row that shrinks to the demo width keeps equal heights. */
    .stage-col {
      width: calc(100% * var(--ratio) / max(var(--ratio), var(--min-ratio, 0)));
    }

    .demo-card.start .stage-col { margin-left: 0; margin-right: auto; }
    .demo-card.end .stage-col { margin-left: auto; margin-right: 0; }
    .demo-card.start p { text-align: start; }
    .demo-card.end p { text-align: end; }
  }
</style>
