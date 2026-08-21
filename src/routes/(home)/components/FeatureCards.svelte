<script>
  import LoopCard from './LoopCard.svelte'

  const cards = [
    {
      src: '/home/hierarchy.mp4',
      title: 'Natural hierarchy',
      body: 'Any task can become a list. Nest until it matches how you think.'
    },
    {
      src: '/home/timelines.mp4',
      title: 'Integrated timelines',
      body: 'Long-term dates sit next to today, so priorities stay in view.'
    },
    {
      src: '/home/habits.mp4',
      title: 'Icon habits',
      body: 'Reminders take a square, not a paragraph. The board stays scannable.'
    }
  ]
</script>

<div class="flex flex-col gap-4 md:flex-row md:gap-3">
  {#each cards as card (card.src)}
    <LoopCard {...card} />
  {/each}
</div>
