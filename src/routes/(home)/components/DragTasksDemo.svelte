<script>
  import { onMount, tick } from 'svelte'
  import { DateTime } from 'luxon'
  import { round } from '$lib/utils/core.js'
  import DemoCard from './DemoCard.svelte'
  import DemoPointer from './DemoPointer.svelte'
  import { boxWithin, createLoop, createShow, elementRef, keyedRefs, setMotionPaused } from './demoLoop.js'

  let { title = '', play = false, visible = false, onend = () => {} } = $props()

  const today = DateTime.now().startOf('day')
  const firstDay = today.plus({ days: 6 })
  const secondDay = firstDay.plus({ days: 1 })
  const bookDay = today.minus({ days: 4 })
  const docsDay = today.minus({ days: 21 })
  const dayPx = 4

  const nodes = [
    { id: 'docs', name: 'Gather documents', dt: docsDay, day: 0 },
    { id: 'book', name: 'Book appointment', dt: bookDay, day: daysBetween(docsDay, bookDay) },
    { id: 'interview', name: 'Interview', dt: null, day: null }
  ]
  const days = [
    { id: 'tue', dt: firstDay },
    { id: 'wed', dt: secondDay }
  ]
  const interviewOffsets = {
    unset: daysBetween(docsDay, bookDay) + 1,
    tue: daysBetween(docsDay, firstDay),
    wed: daysBetween(docsDay, secondDay)
  }

  function daysBetween (a, b) {
    return Math.round(b.diff(a, 'days').days)
  }

  function relativeLabel (dt) {
    if (!dt) return 'select date'
    const days = Math.round(dt.startOf('day').diff(today, 'days').days)
    if (days === 0) return 'today'
    if (days === 1) return 'tomorrow'
    const d = Math.abs(days)
    const amount =
      d < 28 ? `${d}d` :
      d < 365 ? `${round(d / 30)}mo` :
      `${round(d / 365)}y`
    return days < 0 ? `${amount} ago` : `in ${amount}`
  }

  function upcoming (dt) {
    return !!dt && dt.startOf('day') >= today
  }

  const hours = ['9', '10', '11', '12']
  const preview = 'absolute inset-0 rounded-[6px] border border-dashed border-[rgba(100,100,255,0.6)] bg-[rgba(100,100,255,0.15)]'

  let stage = $state(null)
  const stageRef = elementRef((node) => { stage = node })
  const rows = keyedRefs()

  let placed = $state(null)
  let flying = $state(null)
  let previewDay = $state(null)
  let instant = $state(false)
  let ready = $state(false)
  let playing = $state(false)
  let ended = $state(false)
  let armed = $state(false)
  let solo = $state(false)
  let token = $state(0)
  let loop
  let pointer = $state({ x: 0, y: 0, glide: false })
  let alive = true

  let interviewDay = $derived(interviewOffsets[placed] ?? interviewOffsets.unset)

  function interviewDate () {
    if (placed === 'wed') return secondDay
    if (placed === 'tue') return firstDay
    return null
  }
  let gaps = $derived(nodes.slice(0, -1).map((node, i) => {
    const next = nodes[i + 1]
    const from = node.day ?? interviewDay
    const to = next.day ?? interviewDay
    return Math.max(1, to - from) * dayPx
  }))

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
      pointer = { x, y, glide: false }
      return
    }
    pointer.glide = true
    afterPaint(() => {
      pointer.x = x
      pointer.y = y
    })
  }

  function pointAt (key, glide) {
    const el = rows.nodes[key]
    if (!stage || !el) return
    const box = boxWithin(stage, el)
    movePointer(box.x + Math.min(28, box.w * 0.4), box.y + box.h * 0.45, glide)
  }

  function liftFrom (key, from) {
    const el = rows.nodes[key]
    if (!stage || !el) return
    const box = boxWithin(stage, el)
    flying = { from, x: box.x, y: box.y, w: box.w, h: box.h, glide: false }
  }

  function glideTo (key) {
    const el = rows.nodes[key]
    if (!stage || !el || !flying) return
    const box = boxWithin(stage, el)
    previewDay = key
    flying.glide = true
    pointer.glide = true
    afterPaint(() => {
      if (!flying) return
      flying.x = box.x
      flying.y = box.y
      flying.w = box.w
      flying.h = box.h
      pointer.x = box.x + Math.min(18, box.w * 0.4)
      pointer.y = box.y + Math.min(16, box.h * 0.45)
    })
  }

  function drop (day) {
    placed = day
    flying = null
    previewDay = null
  }

  function reset () {
    instant = true
    placed = null
    flying = null
    previewDay = null
    pointer.glide = false
    afterPaint(() => { instant = false })
  }

  const active = $derived((play || solo) && visible)

  const show = createShow({
    reset () {
      ended = false
      playing = false
      ready = false
      reset()
      loop?.stop()
    },
    start () {
      playing = true
      setMotionPaused(stage, false)
      loop?.start()
    },
    pause () {
      playing = false
      loop?.pause()
      setMotionPaused(stage, true)
    },
    resume () {
      playing = true
      setMotionPaused(stage, false)
      loop?.resume()
    }
  })

  onMount(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      placed = 'wed'
      return
    }

    const steps = [
      { ms: 640, run () {
        reset()
        ready = true
        tick().then(() => { if (alive) pointAt('interview', false) })
      } },
      { ms: 680, run () { pointAt('interview', true) } },
      { ms: 100, run () { liftFrom('interview', 'timeline') } },
      { ms: 860, run () { glideTo('tue') } },
      { ms: 980, run () { drop('tue') } },
      { ms: 640, run () { pointAt('placed', true) } },
      { ms: 100, run () { liftFrom('placed', 'day') } },
      { ms: 860, run () { glideTo('wed') } },
      { ms: 1700, run () { drop('wed') } }
    ]

    loop = createLoop(steps, { once: true, onDone () {
      if (!alive) return
      const sequenced = play && !solo
      solo = false
      playing = false
      ended = true
      show.complete()
      if (sequenced) onend()
    } })
    armed = true
    return () => {
      alive = false
      loop.stop()
    }
  })

  $effect(() => {
    if (!armed) return
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

<DemoCard ratio={1728 / 1080} theme="naturalGreen" {title} ontoggle={active && !ended ? toggle : undefined} showReplay={ended} onreplay={replay}>
  <div {@attach stageRef} class={['absolute inset-0 grid grid-cols-2', instant && 'instant']}>
    <div class="flex flex-col bg-[var(--todo-list-bg-color)] px-3 pt-3">
      <div class="mb-2 text-[0.8125rem] font-semibold text-[var(--task-name-color)]">Visa application</div>
      <div class="track flex flex-col">
        {#each nodes as node, i (node.id)}
          <div {@attach rows.attach(node.id)} class="node" style:margin-bottom="{gaps[i] ?? 0}px">
            <span class="dot"></span>
            <span class="min-w-0 truncate text-[0.8125rem] text-[var(--task-name-color)]">{node.name}</span>
            <span class={['badge', upcoming(node.id === 'interview' ? interviewDate() : node.dt) && 'set']}>
              {relativeLabel(node.id === 'interview' ? interviewDate() : node.dt)}
            </span>
          </div>
        {/each}
      </div>
    </div>

    <div class="flex min-h-0 flex-col bg-[var(--cal-bg)]">
      <div class="grid grid-cols-2 px-1.5 pt-2.5">
        {#each days as day (day.id)}
          <div class="px-1">
            <div class="flex items-center justify-center gap-1 text-[0.8125rem] text-neutral-700">
              <span>{day.dt.toFormat('ccc')}</span>
              <span>{day.dt.toFormat('d')}</span>
            </div>
            <div {@attach rows.attach(day.id)} class="relative mt-1 min-h-8">
              {#if previewDay === day.id}
                <div class={preview}></div>
              {/if}
              {#if placed === day.id && flying?.from !== 'day'}
                <div {@attach rows.attach('placed')} class="chip">Interview</div>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <div class="relative grid min-h-0 flex-1 grid-rows-4">
        {#each hours as hour (hour)}
          <div class="hour">
            <span>{hour}</span>
          </div>
        {/each}
      </div>
    </div>

    {#if flying}
      <div
        class={[
          'pointer-events-none absolute top-0 left-0 z-20 flex items-center overflow-hidden px-1.5',
          flying.glide && 'transition-[transform,width,height] duration-700 ease-out'
        ]}
        style:width="{flying.w}px"
        style:height="{flying.h}px"
        style:transform="translate({flying.x}px, {flying.y}px)"
      >
        <span class="truncate text-[0.75rem] text-[var(--task-name-color)]">Interview</span>
      </div>
    {/if}

    <DemoPointer x={pointer.x} y={pointer.y} glide={pointer.glide} visible={ready} />
  </div>
</DemoCard>

<style>
  .track {
    position: relative;
    margin-left: 0.35rem;
    padding-left: 0.9rem;
  }

  .track::before {
    content: '';
    position: absolute;
    top: 0.45rem;
    bottom: 0.45rem;
    left: 0.2rem;
    width: 1px;
    background: #e4e4e4;
  }

  .node {
    position: relative;
    display: flex;
    min-height: 1.35rem;
    align-items: center;
    gap: 0.35rem;
    transition: margin-bottom 0.45s ease;
  }

  .instant .node {
    transition: none;
  }

  .dot {
    position: absolute;
    top: 50%;
    left: -0.9rem;
    width: 0.5rem;
    height: 0.5rem;
    border: 1.5px solid #c8c8c8;
    border-radius: 999px;
    background: var(--todo-list-bg-color);
    transform: translateY(-50%);
  }

  .badge {
    margin-left: auto;
    flex-shrink: 0;
    border-radius: 6px;
    background: rgb(231, 231, 231);
    padding: 1px 4px;
    font-size: 10px;
    line-height: 1.3;
    color: grey;
    white-space: nowrap;
  }

  .badge.set {
    background: hsla(0, 100%, 0%, 0.6);
    color: white;
  }

  .chip {
    display: flex;
    min-height: 1.35rem;
    align-items: center;
    overflow: hidden;
    padding: 0 0.2rem;
    background: transparent;
    font-size: 0.75rem;
    color: var(--task-name-color);
    white-space: nowrap;
  }

  .hour {
    position: relative;
    border-top: 1px solid var(--grid-color);
  }

  .hour span {
    position: absolute;
    top: 2px;
    left: 3px;
    font-size: 10px;
    line-height: 1;
    color: #a3a3a3;
  }

  .hour::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    background: var(--grid-color);
  }

  @media (prefers-reduced-motion: reduce) {
    .node { transition: none; }
  }
</style>
