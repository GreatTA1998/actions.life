<script>
  import { createEventDispatcher, tick } from 'svelte'

  export let value = ''

  $: if (isMenuDisplayed) {
    tick().then(() => {
      scrollToSelected()
    })
  }

  const dispatch = createEventDispatcher()
  let isMenuDisplayed = false

  const hourChoices = []
  for (let i = 6; i < 24; i++) {
    let hh = i
    if (hh < 10) {
      hh = `0${hh}`
    }
    hourChoices.push(hh + ':' + '00')
    hourChoices.push(hh + ':' + '30')
  }

  function scrollToSelected() {
    const elements = document.getElementsByClassName('selected')
    const el = elements[0]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function selectTime(hourChoice) {
    dispatch('time-selected', { selectedHHMM: hourChoice })
    isMenuDisplayed = false
  }
</script>

<div>
  <input {value}
    placeholder='hh:mm'
    pattern='[0-9]{2}:[0-9]{2}'
    on:input={(e) => dispatch('input', { typedHHMM: e.target.value })}
    on:click={() => (isMenuDisplayed = !isMenuDisplayed)}
    on:focusout={() => {
      setTimeout(() => (isMenuDisplayed = false), 500)
    }}
    class="time-dropdown"
  />

  {#if isMenuDisplayed}
    <div
      class="core-shadow cast-shadow"
      style="position: absolute; background: white; overflow-y: auto; overflow-x: hidden; width: fit-content;"
    >
      <div class="my-grid">
        {#each hourChoices as hourChoice}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div on:click={() => selectTime(hourChoice)}
            class="time-option"
            class:selected={Number(hourChoice.split(':')[0]) === new Date().getHours()}
            class:highlighted-option={value === hourChoice}
            class:closest-to-current-time={Number(hourChoice.split(':')[0]) === new Date().getHours()}
          >
            {hourChoice}
          </div>
        {/each}
      </div>
    </div>
  {/if}
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
    overflow-y: auto;
    height: 240px;
  }

  .time-option {
    padding: 4px 8px;
    font-size: 16px;

    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;

    border: 1px solid lightgrey;
    border-radius: 0px;
  }

  .option-highlight {
    background-color: rgb(240, 240, 240);
  }

  .time-option:hover {
    @extend .option-highlight;
  }

  .closest-to-current-time {
    // color: var(--logo-twig-color);
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
