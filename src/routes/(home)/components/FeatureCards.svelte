<script>
  import LoopCard from './LoopCard.svelte'

  const cards = [
    {
      playbackID: 'PxZ4opljhn85wvrJ3C8Rc4OqbUnyIN63TWZj01wzAeRQ',
      title: 'Drag',
      detail: 'tasks to the calendar',
      aspectRatio: 1180 / 2556
    },
    {
      playbackID: 'L8d9WO79zZquXsKc41Xan8Iq3674mn2PE00sZTJr9ZuQ',
      title: 'Create',
      detail: 'tasks by targeting your click',
      aspectRatio: 1728 / 1080
    },
    {
      playbackID: 'TeW1lY2RmWseIjbbBwEW4vFiB8wRWUn2sd00Oyw2inlY',
      title: 'Draw',
      detail: 'your own habit icons',
      aspectRatio: 1264 / 1680
    }
  ]

  let selected = $state.raw(cards[0])
</script>

<div class="flex flex-col items-center gap-4">
  <div class="flex flex-col items-center gap-4">
    <h2 class="m-0 uppercase font-semibold tracking-[-0.02em] text-[clamp(1.125rem,1.5vw,1.375rem)] text-gray-600">
      How to use
    </h2>
    <div class="flex flex-wrap justify-center gap-1.5">
      {#each cards as card (card.playbackID)}
        {@const active = selected.playbackID === card.playbackID}
        <button
          onclick={() => selected = card}
          class={[
            'inline-flex items-center rounded-full border-solid border-1 bg-transparent px-2.5 py-1 text-sm tracking-tight whitespace-nowrap',
            active
              ? 'border-gray-900 text-gray-900'
              : 'border-black/15 text-gray-500 hover:border-black/30 hover:text-gray-700'
          ]}
        >
          {card.title}<span
            class={[
              'inline-grid overflow-hidden transition-[grid-template-columns] duration-200 ease-out motion-reduce:transition-none',
              active ? 'grid-cols-[1fr]' : 'grid-cols-[0fr]'
            ]}
          >
            <span class="min-w-0 overflow-hidden">
              <span class="block w-max whitespace-nowrap pl-[0.3em]">{card.detail}</span>
            </span>
          </span>
        </button>
      {/each}
    </div>
  </div>

  <div class="flex h-[calc(32rem+0.5rem+1.25rem)] w-full items-start justify-center">
    <LoopCard playbackID={selected.playbackID} aspectRatio={selected.aspectRatio} />
  </div>
</div>
