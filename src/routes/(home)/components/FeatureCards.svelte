<script>
  import LoopCard from './LoopCard.svelte'
  import SiSafari from 'virtual:icons/simple-icons/safari'
  import SiGooglechrome from 'virtual:icons/simple-icons/googlechrome'
  import SiAndroid from 'virtual:icons/simple-icons/android'

  const cards = [
    {
      playbackID: 'L8d9WO79zZquXsKc41Xan8Iq3674mn2PE00sZTJr9ZuQ',
      title: 'Create',
      detail: 'subtasks by targeting your click',
      platform: 'Desktop',
      Icon: SiGooglechrome,
      aspectRatio: 1728 / 1080
    },
    {
      playbackID: 'PxZ4opljhn85wvrJ3C8Rc4OqbUnyIN63TWZj01wzAeRQ',
      title: 'Drag',
      detail: 'tasks to the calendar',
      platform: 'iOS 26+',
      Icon: SiSafari,
      aspectRatio: 1180 / 2556
    },
    {
      playbackID: 'TeW1lY2RmWseIjbbBwEW4vFiB8wRWUn2sd00Oyw2inlY',
      title: 'Draw',
      detail: 'your own habit icons',
      platform: 'Android 13+',
      Icon: SiAndroid,
      aspectRatio: 1264 / 1680
    }
  ]

  let playingId = $state(null)

  function toggle(id) {
    playingId = playingId === id ? null : id
  }
</script>

<div class="flex flex-col items-center gap-10">
  <div class="flex w-full flex-col items-center gap-12 md:flex-row md:items-start md:justify-center md:gap-8">
    {#each cards as card (card.playbackID)}
      <figure class="m-0 flex flex-col items-center gap-3">
        <figcaption class="m-0 text-center text-[0.9375rem] leading-snug tracking-[-0.02em] text-gray-600">
          <span class="font-normal text-gray-500">{card.title}</span>
          <span class="font-normal text-gray-500"> {card.detail}</span>
        </figcaption>
        <LoopCard
          playbackID={card.playbackID}
          aspectRatio={card.aspectRatio}
          platform={card.platform}
          Icon={card.Icon}
          playing={playingId === card.playbackID}
          ontoggle={() => toggle(card.playbackID)}
        />
      </figure>
    {/each}
  </div>
</div>
