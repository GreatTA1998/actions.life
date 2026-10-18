<script>
  import { onMount } from 'svelte'
  import CreateClickDemo from './CreateClickDemo.svelte'
  import DragTasksDemo from './DragTasksDemo.svelte'
  import ConnectDemo from './ConnectDemo.svelte'

  const cards = [
    { id: 'create', title: 'Click to create tasks' },
    { id: 'drag', title: 'Drag to move and schedule' },
    { id: 'connect', title: 'Customize and integrate', still: true }
  ]

  let full = $state({ create: false, drag: false, connect: false })
  let cursor = $state(0)
  let mode = $state('wait')
  let reduced = false

  function watch (id) {
    return (node) => {
      const observer = new IntersectionObserver(([entry]) => {
        const now = entry.isIntersecting && entry.intersectionRatio >= 0.99
        if (full[id] === now) return
        full[id] = now
        kick()
      }, { threshold: [0, 0.99, 1] })
      observer.observe(node)
      return () => observer.disconnect()
    }
  }

  function kick () {
    if (reduced || mode === 'done') return
    const id = cards[cursor].id
    if (full[id]) mode = 'run'
    else if (mode === 'run') mode = 'wait'
  }

  function finish (id) {
    if (reduced || cards[cursor].id !== id || mode === 'done') return
    cursor += 1
    while (cursor < cards.length && cards[cursor].still) cursor += 1
    if (cursor >= cards.length) {
      mode = 'done'
      return
    }
    mode = full[cards[cursor].id] ? 'run' : 'wait'
  }

  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
</script>

<div class="flex w-full min-w-0 flex-col items-center">
  <div class="flex w-full min-w-0 flex-col items-center gap-12 md:w-max md:max-w-full md:flex-row md:items-start md:justify-between md:gap-8">
    {#each cards as card, i (card.id)}
      <div {@attach watch(card.id)} class="w-max max-w-full">
        {#if card.id === 'create'}
          <CreateClickDemo title={card.title} play={mode === 'run' && cursor === i} visible={full[card.id]} onend={() => finish(card.id)} />
        {:else if card.id === 'drag'}
          <DragTasksDemo title={card.title} play={mode === 'run' && cursor === i} visible={full[card.id]} onend={() => finish(card.id)} />
        {:else}
          <ConnectDemo title={card.title} />
        {/if}
      </div>
    {/each}
  </div>
</div>
