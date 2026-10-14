<script>
  import { onMount } from 'svelte'
  import { DateTime } from 'luxon'
  import DemoCard from './DemoCard.svelte'
  import DemoPointer from './DemoPointer.svelte'
  import DemoTask from './DemoTask.svelte'
  import { boxWithin, createLoop, createShow, elementRef, keyedRefs, setMotionPaused } from './demoLoop.js'

  let { title = '', play = false, visible = false, onend = () => {} } = $props()

  let stage = $state(null)
  let motionRoot = $state(null)
  const stageRef = elementRef((node) => { stage = node })
  const motionRef = elementRef((node) => { motionRoot = node })
  const aims = keyedRefs()

  let siblingOn = $state(false)
  let subtaskOn = $state(false)
  let siblingMade = $state(false)
  let subtaskMade = $state(false)
  let siblingText = $state('')
  let subtaskText = $state('')
  let playing = $state(false)
  let ended = $state(false)
  let instant = $state(false)
  let ready = $state(false)
  let pulse = $state(0)
  let booted = false
  let solo = $state(false)
  let token = $state(0)
  let pointer = $state({ x: 0, y: 0, glide: false, visible: false })
  let hints = $state(false)
  let loop
  let alive = true

  const today = DateTime.now().startOf('day')
  const days = [today, today.plus({ days: 1 })]
  const hours = [9, 10]

  function afterPaint (fn) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!alive) return
        fn()
        if (!playing) setMotionPaused(motionRoot, true)
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

  function hidePointer () {
    pointer.glide = false
    pointer.visible = false
    hints = false
  }

  function clearBoard () {
    siblingOn = false
    subtaskOn = false
    siblingMade = false
    subtaskMade = false
    siblingText = ''
    subtaskText = ''
    hidePointer()
  }

  const active = $derived((play || solo) && visible)

  const show = createShow({
    reset () {
      booted = false
      ended = false
      playing = false
      instant = true
      clearBoard()
      loop?.stop()
    },
    start () {
      playing = true
      setMotionPaused(motionRoot, false)
      afterPaint(() => {
        if (!playing) return
        instant = false
        booted = true
        loop?.start()
      })
    },
    pause () {
      playing = false
      loop?.pause()
      setMotionPaused(motionRoot, true)
    },
    resume () {
      playing = true
      setMotionPaused(motionRoot, false)
      if (!booted) {
        afterPaint(() => {
          if (!playing) return
          instant = false
          booted = true
          loop?.start()
        })
        return
      }
      loop?.resume()
    }
  })

  function pointAt (key, glide) {
    hints = true
    afterPaint(() => {
      if (!playing) return
      const el = aims.nodes[key]
      if (!stage || !el) return
      const box = boxWithin(stage, el)
      movePointer(box.x, box.y, glide)
    })
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
      { ms: 360, run () { siblingText = ''; subtaskText = ''; hidePointer() } },
      { ms: 80, run () { pointAt('rest', false) } },
      { ms: 560, run () { pointAt('sib', true) } },
      { ms: 480, run () { pulse += 1; siblingOn = true; siblingText = '' } },
      { ms: 860, run () { hidePointer() } },
      ...typeInto((value) => { siblingText = value }, 'Buy groceries', 640),
      { ms: 900, run () { siblingOn = false; siblingMade = true } },
      { ms: 560, run () { pointAt('sub', true) } },
      { ms: 480, run () { pulse += 1; subtaskOn = true; subtaskText = '' } },
      { ms: 860, run () { hidePointer() } },
      ...typeInto((value) => { subtaskText = value }, 'Book flights', 640),
      { ms: 900, run () { subtaskOn = false; subtaskMade = true } }
    ]

    loop = createLoop(steps, { once: true, onDone () {
      if (!alive) return
      const sequenced = play && !solo
      solo = false
      playing = false
      ended = true
      hidePointer()
      show.complete()
      if (sequenced) onend()
    } })
    ready = true
    return () => {
      alive = false
      loop.stop()
    }
  })

  $effect(() => {
    if (!ready) return
    show.sync(active, token)
  })

  function toggle () {
    show.toggle()
    show.sync(active, token)
  }

  function replay () {
    solo = true
    token += 1
  }
</script>

<DemoCard ratio={9 / 16} minRatio={0.92} theme="mutedEarth" align="start" {title} ontoggle={active && !ended ? toggle : undefined} showReplay={ended} onreplay={replay}>
  <div {@attach motionRef} class="absolute inset-0">
  <div class={['absolute inset-0 flex flex-col overflow-hidden rounded-2xl', instant && 'instant']}>
    <div class="cal flex min-h-0 flex-[0_0_33.333%] flex-col overflow-hidden rounded-t-2xl bg-[var(--cal-bg)]">
      <div class="grid grid-cols-2 px-3 pt-3.5">
        {#each days as day (day.toISODate())}
          <div class="text-center text-[0.6875rem] leading-none text-neutral-700">
            {day.toFormat('ccc')} {day.toFormat('d')}
          </div>
        {/each}
      </div>
      <div class="relative mx-3 mt-2 grid min-h-0 flex-1 grid-rows-2">
        {#each hours as hour (hour)}
          <div class="cal-hour"><span>{hour}</span></div>
        {/each}
      </div>
    </div>
    <div {@attach stageRef} class={['board relative flex min-h-0 flex-1 flex-col justify-start px-3.5 pt-2', hints && 'hints']}>
    <div class="dz">
      <div class="zone"></div>
    </div>

    <DemoTask name="Plan the trip" />

    <div class={['child', subtaskMade && 'shown']}>
      <div class="subdz"><div class="zone"></div></div>
      <DemoTask name="Book flights" strong={false} />
    </div>

    <div class="zones">
      <div class="zone outer"></div>
      <div class="zone inner"></div>
      <div class="zone deeper" class:shown={subtaskMade}></div>

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

    <div class={['dz tail', siblingMade && 'shown']}>
      <div class="zone"></div>
      <div class="ghost"></div>
    </div>

    </div>
  </div>
  </div>

  {#snippet hand()}
    <div class="absolute top-1/3 right-0 bottom-0 left-0">
      <DemoPointer tap x={pointer.x} y={pointer.y} glide={pointer.glide} visible={pointer.visible} {pulse} />
    </div>
  {/snippet}
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
    opacity: 1;
  }

  .child.shown {
    max-height: 4rem;
  }

  .sibling.shown {
    max-height: 2.5rem;
  }

  .board {
    /* Same ratios as the list: root font 1rem, ROOT_DROPZONE 1.5rem, SUB_DROPZONE 1rem. */
    --root-dz: calc(0.875rem * 1.5);
    --sub-dz: 0.875rem;
  }

  .subdz {
    position: relative;
    height: var(--sub-dz);
    flex-shrink: 0;
  }

  .dz {
    position: relative;
    height: var(--root-dz);
    min-height: var(--root-dz);
    flex-shrink: 0;
  }

  .dz.tail {
    height: 0;
    min-height: 0;
    margin-bottom: 0;
    overflow: hidden;
  }

  .dz.tail.shown {
    height: var(--root-dz);
    min-height: var(--root-dz);
  }

  .zone,
  .ghost {
    opacity: 0;
    transition: opacity 0.18s ease;
  }

  .board.hints .zone:not(.deeper),
  .board.hints .ghost,
  .board.hints .zone.deeper.shown {
    opacity: 1;
  }

  .dz > .zone,
  .subdz > .zone {
    position: absolute;
    inset: 0;
    border-radius: 6px;
  }

  .ghost {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    left: 2rem;
    height: var(--sub-dz);
    border: 1px dashed rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.72);
  }

  .zones {
    position: relative;
    height: var(--root-dz);
    flex-shrink: 0;
  }

  .zone {
    border: 1px dashed rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 0.28);
  }

  .zone.outer {
    position: absolute;
    inset: 0;
    border-radius: 6px;
  }

  /* Ghost dropzone: same strip as the outer zone, indented, shorter, fully inside it. */
  .zone.inner,
  .zone.deeper {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    height: var(--sub-dz);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.72);
  }

  .zone.inner {
    left: 2rem;
  }

  .zone.deeper {
    z-index: 2;
    left: 4rem;
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
    height: var(--sub-dz);
    font-size: 0.75rem;
    line-height: 1.35;
    border-width: 1px;
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
    overflow: visible;
    line-height: 1.35;
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
    top: 0.15rem;
    left: 0.2rem;
  }

  .aim.sub {
    top: 0.05rem;
    left: 2.55rem;
  }

  @keyframes blink {
    50% { opacity: 0; }
  }

  .instant .zone,
  .instant .field,
  .instant .child,
  .instant .sibling,
  .instant .dz,
  .instant .subdz,
  .instant .zones { transition: none; }

  @media (prefers-reduced-motion: reduce) {
    .zone,
    .field,
    .child,
    .sibling,
    .dz,
    .subdz,
    .zones { transition: none; }
    .caret { animation: none; }
  }
</style>
