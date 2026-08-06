<script>
  let {
    value = $bindable(0),
    /** Evenly spaced marks including ends. 0 = none. e.g. 3 for S/M/L */
    ticks = 0,
    min = 0,
    max = 100,
    step,
    onchange = () => {},
    class: className = '',
    ...rest
  } = $props()

  const snapping = $derived(ticks > 1)
  const inputStep = $derived(snapping ? 'any' : step)

  function snapValue(v) {
    const lo = Number(min)
    const hi = Number(max)
    const stepSize = (hi - lo) / (ticks - 1)
    return lo + Math.round((Number(v) - lo) / stepSize) * stepSize
  }

  function handleChange(e) {
    const snapped = snapValue(e.currentTarget.value)
    value = snapped
    e.currentTarget.value = snapped
    onchange(e)
  }
</script>

<div class={['root', 'relative flex items-center touch-none select-none', className]}>
  {#if ticks > 1}
    <div class="ticks absolute pointer-events-none">
      {#each Array(ticks) as _, i (i)}
        <i
          class="absolute top-1/2 h-2 w-[1.5px] -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-[#c7c7cc]"
          style:left="{(i / (ticks - 1)) * 100}%"
        ></i>
      {/each}
    </div>
  {/if}
  <input
    type="range"
    class="s relative z-[1] m-0 w-full appearance-none cursor-pointer touch-none bg-transparent"
    {...rest}
    {min}
    {max}
    step={inputStep}
    bind:value
    onchange={snapping ? handleChange : onchange}
  />
</div>

<style>
  .root {
    --ts: var(--thumb-size, 1rem);
    --th: var(--track-height, 2px);
    height: var(--ts);
  }

  .ticks {
    inset: 0 calc(var(--ts) / 2);
  }

  .s {
    height: var(--ts);
  }

  .s::-webkit-slider-runnable-track {
    height: var(--th);
    border-radius: 9999px;
    background: var(--track-bg, #d1d1d6);
  }

  .s::-webkit-slider-thumb {
    appearance: none;
    width: var(--ts);
    height: var(--ts);
    margin-top: calc((var(--th) - var(--ts)) / 2);
    border: none;
    border-radius: 50%;
    background: var(--thumb-color, rgb(250, 250, 250, 0.9));
    box-shadow:
      0 0 0 0.5px rgba(0, 0, 0, 0.04),
      0 1px 3px rgba(0, 0, 0, 0.22);
  }

  .s::-moz-range-track {
    height: var(--th);
    border-radius: 9999px;
    background: var(--track-bg, #d1d1d6);
  }

  .s::-moz-range-thumb {
    width: var(--ts);
    height: var(--ts);
    border: none;
    border-radius: 50%;
    background: var(--thumb-color, rgb(250, 250, 250, 0.9));
    box-shadow:
      0 0 0 0.5px rgba(0, 0, 0, 0.04),
      0 1px 3px rgba(0, 0, 0, 0.22);
  }
</style>
