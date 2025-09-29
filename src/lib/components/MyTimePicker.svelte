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
    menuStyles="overflow-y: auto; height: 240px;"
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
    <div class="time-options-grid">
      {#each hourChoices as hhmm}
        <button onclick={() => { selectTime(hhmm); close(); }}
          class="time-option"
          class:highlighted-option={value === hhmm}
        >
          {hhmm}
        </button>
      {/each}
    </div>
  {/snippet}
</div>

<style lang="scss">
  .time-dropdown {
    width: 52px; 
    text-align: center; 
    height: 30px; 
    border-radius: 4px;
    border: none;

    font-size: 14px;
    color: var(--scheduled-info-color);
  }

  .time-options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    padding: 4px;
    gap: 4px;
  }

  .time-option {
    padding: 6px 8px;
    font-size: 14px;
    color: #727272;
  }

  .highlighted-option {
    color: var(--scheduled-info-color);
    font-weight: 600;
  }
</style>
