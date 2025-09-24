<script>
  import { tick } from 'svelte'
  import PopoverMenu  from '$lib/components/PopoverMenu.svelte'

  let { 
    value = '', 
    oninput = () => {},
    onTimeSelected = () => {}
  } = $props()

  let isMenuDisplayed = $state(false)
  const hourChoices = $state([])
  for (let i = 6; i < 24; i++) {
    let hh = i
    if (hh < 10) {
      hh = `0${hh}`
    }
    hourChoices.push(hh + ':' + '00')
    hourChoices.push(hh + ':' + '30')
  }

  $effect(() => {
    if (isMenuDisplayed) {
      tick().then(scrollToSelected)
    }
  })

  function scrollToSelected () {
    const elements = document.getElementsByClassName('selected')
    const el = elements[0]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function selectTime (hhmm) {
    console.log('selectTime')
    onTimeSelected(hhmm)
    isMenuDisplayed = false
  }
</script>

<div>
  <PopoverMenu 
    {activator} 
    {content}
    menuStyles="width: fit-content; overflow-y: auto; background: white; height: 240px; padding: 0;"
    menuClasses=""
  />

  {#snippet activator ({ open, close, toggle })}
    <input {value}
      placeholder='hh:mm'
      pattern='[0-9]{2}:[0-9]{2}'
      {oninput}
      onclick={open}
      class="time-dropdown"
    />
  {/snippet}

  {#snippet content({ close })}
    <!-- <div
      class="core-shadow cast-shadow"
      style="position: absolute; background: white; overflow-y: auto; width: fit-content;"
    > -->
      <div class="my-grid">
        {#each hourChoices as hhmm}
          <div onclick={() => { selectTime(hhmm); close(); }}
            class="time-option"
            class:selected={Number(hhmm.split(':')[0]) === new Date().getHours()}
            class:highlighted-option={value === hhmm}
            class:closest-to-current-time={Number(hhmm.split(':')[0]) === new Date().getHours()}
          >
            {hhmm}
          </div>
        {/each}
      </div>
    <!-- </div> -->
  {/snippet}
</div>

<style lang="scss">
  .time-dropdown {
    width: 52px; 
    text-align: center; 
    height: 30px; 
    border-radius: 4px;
    border: 0px solid lightgrey;

    font-size: 14px;
    color: #808080;
  }

  .my-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: fit-content;
    // overflow-y: auto;
    // height: 240px;
  }

  .time-option {
    padding: 4px 8px;
    font-size: 16px;

    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;

    border: 1px solid rgb(0, 0, 0);
    border-radius: 0px;
  }

  .option-highlight {
    background-color: rgb(240, 240, 240);
  }

  .time-option:hover {
    @extend .option-highlight;
  }

  .closest-to-current-time {
    border-top: 4 px solid var(--logo-twig-color);
  }

  .highlighted-option {
    background-color: rgb(37, 37, 37);
    color: white;
    font-weight: 600;
  }

  .invisible {
    display: none;
  }
</style>
