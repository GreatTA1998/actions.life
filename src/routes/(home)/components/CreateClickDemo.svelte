<script>
  import { onMount } from 'svelte'
  import { DateTime } from 'luxon'
  import DemoCard from './DemoCard.svelte'
  import DemoPointer from './DemoPointer.svelte'
  import DemoTask from './DemoTask.svelte'
  import { boxWithin, createLoop, elementRef, keyedRefs, setMotionPaused } from './demoLoop.js'

  let { title = '', platform = '', Icon = null } = $props()

  let stage = $state(null)
  const stageRef = elementRef((node) => { stage = node })
  const aims = keyedRefs()

  let hot = $state(null)
  let siblingOn = $state(false)
  let subtaskOn = $state(false)
  let siblingMade = $state(false)
  let subtaskMade = $state(false)
  let siblingText = $state('')
  let subtaskText = $state('')
  let playing = $state(true)
  let canToggle = $state(false)
  let pulse = $state(0)
  let pointer = $state({ x: 0, y: 0, glide: false, visible: false })
  let loop
  let alive = true

  const today = DateTime.now().startOf('day')
  const days = [today, today.plus({ days: 1 })]
  const hours = [9, 10, 11]

  function afterPaint (fn) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!alive) return
        fn()
        if (!playing) setMotionPaused(stage, true)
      })
    })
  }

  function movePointer (x, y, glide) {
    if (!glide) {
      pointer = { ...pointer, x, y, glide: false, visible: true }
      return
    }
    pointer.glide = true
    pointer.visible = true
    afterPaint(() => {
      pointer.x = x
      pointer.y = y
    })
  }

  function pointAt (key, glide) {
    const el = aims.nodes[key]
    if (!stage || !el) return
    const box = boxWithin(stage, el)
    movePointer(box.x, box.y, glide)
  }

  function typeInto (write, word, hold) {
    return [...word].map((_, i) => ({
      ms: i === word.length - 1 ? hold : 95,
      run () { write(word.slice(0, i + 1)) }
    }))
  }

  onMount(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      siblingMade = true
      subtaskMade = true
      return
    }

    const steps = [
      { ms: 520, run () {
        hot = null
        siblingOn = false
        subtaskOn = false
        siblingMade = false
        subtaskMade = false
      } },
      { ms: 80, run () { siblingText = ''; subtaskText = ''; pointAt('rest', false) } },
      { ms: 740, run () { hot = 'sibling'; pointAt('sib', true) } },
      { ms: 260, run () { pulse += 1; hot = null; siblingOn = true; siblingText = '' } },
      ...typeInto((value) => { siblingText = value }, 'Buy groceries', 640),
      { ms: 1200, run () { siblingOn = false; siblingMade = true } },
      { ms: 740, run () { hot = 'sub'; pointAt('sub', true) } },
      { ms: 260, run () { pulse += 1; hot = null; subtaskOn = true; subtaskText = '' } },
      ...typeInto((value) => { subtaskText = value }, 'Book flights', 640),
      { ms: 1700, run () { subtaskOn = false; subtaskMade = true } }
    ]

    loop = createLoop(steps)
    loop.start()
    canToggle = true
    return () => {
      alive = false
      loop.stop()
    }
  })

  function toggle () {
    playing = !playing
    if (playing) {
      setMotionPaused(stage, false)
      loop?.resume()
    } else {
      loop?.pause()
      setMotionPaused(stage, true)
    }
  }
</script>

<DemoCard ratio={9 / 16} minRatio={0.92} theme="mutedEarth" {title} {platform} {Icon} ontoggle={canToggle ? toggle : undefined}>
  <div class="absolute inset-0 flex flex-col">
    <div class="cal flex min-h-0 flex-[0_0_42%] flex-col overflow-hidden rounded-t-2xl bg-[var(--cal-bg)]">
      <div class="grid grid-cols-2 px-3 pt-3.5">
        {#each days as day (day.toISODate())}
          <div class="text-center text-[0.6875rem] leading-none text-neutral-700">
            {day.toFormat('ccc')} {day.toFormat('d')}
          </div>
        {/each}
      </div>
      <div class="relative mx-3 mt-2 grid min-h-0 flex-1 grid-rows-3">
        {#each hours as hour (hour)}
          <div class="cal-hour"><span>{hour}</span></div>
        {/each}
      </div>
    </div>
    <div {@attach stageRef} class="relative flex min-h-0 flex-1 flex-col justify-start px-3.5 pt-3">
    <DemoTask name="Plan the trip" />

    <div class={['child', subtaskMade && 'shown']}>
      <DemoTask name="Book flights" strong={false} />
    </div>

    <div class="zones">
      <div class="zone outer" class:hot={hot === 'sibling'}></div>
      <div class="zone inner" class:hot={hot === 'sub'}></div>

      <div class="field outer" class:shown={siblingOn}>
        <span class="name">{siblingText}</span><span class="caret"></span>
      </div>
      <div class="field inner" class:shown={subtaskOn}>
        <span class="name">{subtaskText}</span><span class="caret"></span>
      </div>

      <span class="aim rest" {@attach aims.attach('rest')}></span>
      <span class="aim sib" {@attach aims.attach('sib')}></span>
      <span class="aim sub" {@attach aims.attach('sub')}></span>
    </div>

    <div class={['sibling', siblingMade && 'shown']}>
      <DemoTask name="Buy groceries" />
    </div>

    <DemoPointer tap x={pointer.x} y={pointer.y} glide={pointer.glide} visible={pointer.visible} {pulse} />
    </div>
  </div>
</DemoCard>

<style>
  .cal {
    border-bottom: 1px solid var(--grid-color);
  }

  .cal-hour {
    position: relative;
    border-top: 1px solid var(--grid-color);
  }

  .cal-hour span {
    position: absolute;
    top: 1px;
    left: 3px;
    font-size: 9px;
    line-height: 1;
    color: #a3a3a3;
  }

  .cal-hour::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    background: var(--grid-color);
  }

  .child,
  .sibling {
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: max-height 0.35s ease, opacity 0.35s ease, margin 0.35s ease;
  }

  .child {
    padding-left: 2rem;
  }

  .child.shown,
  .sibling.shown {
    max-height: 2.25rem;
    opacity: 1;
  }

  .child.shown {
    margin-top: 0.35rem;
  }

  .sibling.shown {
    margin-top: 0.2rem;
  }

  .zones {
    position: relative;
    height: 1.5rem;
    margin-top: 0.45rem;
  }

  .zone {
    border: 1px dashed rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 0.28);
    transition: background 0.4s ease, border-color 0.4s ease;
  }

  .zone.outer {
    position: absolute;
    inset: 0;
    border-radius: 6px;
  }

  /* Ghost dropzone: same strip as the outer zone, indented, shorter, fully inside it. */
  .zone.inner {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    left: 2rem;
    height: 1rem;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.72);
  }

  .hot {
    background: rgba(100, 100, 255, 0.1);
    border-color: rgba(39, 87, 207, 0.45);
  }

  /* PopoverInput fills the clicked dropzone: blue border, the zone's exact box. */
  .field {
    position: absolute;
    z-index: 2;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0 0.35rem;
    line-height: 1.35;
    border: 2px solid #2757cf;
    border-radius: 4px;
    background: #fff;
    color: #1a1a1a;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.18s ease;
  }

  .field.outer {
    inset: 0;
    font-size: 0.8125rem;
    line-height: 1.45;
  }

  .field.inner {
    z-index: 3;
    top: 0;
    right: 0;
    left: 2rem;
    height: 1rem;
    font-size: 0.75rem;
    line-height: 1;
  }

  .field.shown {
    opacity: 1;
  }

  .name {
    overflow: hidden;
    line-height: 1.35;
    white-space: nowrap;
  }

  .field.outer .name {
    line-height: 1.45;
  }

  .field.inner .name {
    line-height: 1;
  }

  .caret {
    width: 1.5px;
    height: 1.05em;
    margin-left: 1px;
    background: #1a1a1a;
    animation: blink 1.05s steps(1) infinite;
  }

  .aim {
    position: absolute;
    width: 0;
    height: 0;
  }

  .aim.rest {
    top: 1.7rem;
    left: 0.1rem;
  }

  .aim.sib {
    top: 1.28rem;
    left: 0.12rem;
  }

  .aim.sub {
    top: 0.78rem;
    left: 2.12rem;
  }

  @keyframes blink {
    50% { opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .zone,
    .field,
    .child,
    .sibling { transition: none; }
    .caret { animation: none; }
  }
</style>
