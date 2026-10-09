<script>
  import SiSafari from 'virtual:icons/simple-icons/safari'
  import SiGooglechrome from 'virtual:icons/simple-icons/googlechrome'
  import SiAndroid from 'virtual:icons/simple-icons/android'
  import CreateClickDemo from './CreateClickDemo.svelte'
  import DragTasksDemo from './DragTasksDemo.svelte'
  import ConnectDemo from './ConnectDemo.svelte'

  const cards = [
    { id: 'create', title: 'Click to create tasks', platform: 'iOS 26+', Icon: SiSafari },
    { id: 'drag', title: 'Drag to move and schedule', platform: 'Chrome', Icon: SiGooglechrome },
    { id: 'connect', title: 'Connect & customize', platform: 'Android 13+', Icon: SiAndroid }
  ]
</script>

<div class="flex w-full min-w-0 flex-col items-center gap-10">
  <div class="flex w-full min-w-0 flex-col items-center gap-12 md:w-max md:max-w-full md:flex-row md:items-start md:justify-between md:gap-8">
    {#each cards as card (card.id)}
      {#if card.id === 'create'}
        <CreateClickDemo title={card.title} platform={card.platform} Icon={card.Icon} />
      {:else if card.id === 'drag'}
        <DragTasksDemo title={card.title} platform={card.platform} Icon={card.Icon} />
      {:else}
        <ConnectDemo title={card.title} platform={card.platform} Icon={card.Icon} />
      {/if}
    {/each}
  </div>
</div>
