<script>
  let {
    title,
    points,
    activeTime,
    onseek,
    children
  } = $props()

  let isActive = $derived(points.some(p => p.t === activeTime))

  function timestamp (seconds) {
    const mm = Math.floor(seconds / 60)
    const ss = seconds % 60
    return `${mm}:${ss.toString().padStart(2, '0')}`
  }
</script>

<div class={['card flex flex-col rounded-2xl w-[360px] py-4 px-2 gap-y-2', isActive && 'card-active']}>
  <button
    onclick={e => onseek(points[0].t, e)}
    class="card-header flex w-full shrink-0 items-center gap-x-2 px-2 justify-start"
    type="button"
  >
    <p class="text-md font-medium text-neutral-800">
      {title}
    </p>
    <div class="logos">
      {@render children?.()}
    </div>
  </button>

  <p class="prose px-2">
    {#each points as p, i (p.t)}
      <span
        role="button"
        tabindex="0"
        onclick={e => onseek(p.t, e)}
        onkeydown={e => e.key === 'Enter' && onseek(p.t, e)}
        class={['phrase', p.t === activeTime && 'phrase-active']}
      >{p.label} <span class="time">({timestamp(p.t)})</span></span>{i < points.length - 1 ? '. ' : ''}
    {/each}
  </p>
</div>

<style>
  .card {
    --card-header-height: 2rem;
    background: rgb(237, 241, 246);
    border: 1px solid rgba(160, 200, 240, 0.18);
  }

  /* Fixed header band so list rows align across cards; logos scale down inside it. */
  .card-header {
    box-sizing: border-box;
    height: var(--card-header-height);
    min-height: var(--card-header-height);
  }

  .card-title {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .card-active {
    background: rgb(250, 250, 250);
    border-color: rgb(224, 217, 207);
    /* box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.04),
      0 8px 28px rgba(200, 150, 80, 0.08); */
  }

  .logos {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.375rem;
    flex: 0 1 auto;
    min-width: 0;
    max-height: 100%;
    align-self: stretch;
  }

  /*
    Give logos a definite box (SVG + width/height auto often collapses to 0 in nested flex).
    Shrink horizontally via flex-shrink when the row is crowded; cap vertical growth to the header band.
  */
  .logos > :global(svg),
  .logos > :global(img) {
    box-sizing: border-box;
    flex: 0 1 28px;
    min-width: 0;
    width: 28px;
    height: 28px;
    max-width: 28px;
    max-height: 100%;
    object-fit: contain;
  }

  .logos > :global(div) {
    box-sizing: border-box;
    flex: 0 1 28px;
    min-width: 0;
    width: 28px;
    max-width: 28px;
    height: 100%;
    max-height: 100%;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logos > :global(div) > :global(svg),
  .logos > :global(div) > :global(img) {
    box-sizing: border-box;
    display: block;
    width: 28px;
    height: 28px;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .prose {
    color: rgb(100, 100, 100);
    font-size: 0.8125rem;
    line-height: 1.6;
    letter-spacing: -0.003em;
    margin: 0;
  }

  .phrase {
    cursor: pointer;
    border-radius: 3px;
    transition: color 0.15s ease;
  }

  .phrase-active {
    color: rgb(30, 30, 30);
  }

  .time {
    color: rgba(0, 0, 0, 0.28);
  }

  .phrase-active .time {
    color: #065fd4;
  }
</style>
