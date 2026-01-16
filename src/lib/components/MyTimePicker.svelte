<script>
  import PopoverMenu  from '$lib/components/PopoverMenu.svelte'
  import { trackHeight } from '$lib/utils/svelteActions.js'
  import { getRandomID } from '$lib/utils/core.js'
  import { fieldHeight, paddingVal, fieldWithPlaceholder } from '$lib/styles/reused.module.css'

  let { 
    value = '', 
    oninput = () => {},
    onTimeSelected = () => {}
  } = $props()

  const id = getRandomID()

  let scrollContainer = $state(null)
  let menuHeight = $state(0)

  const start = 6
  const end = 23

  const hourChoices = $state([])
  for (let i = start; i <= end; i++) {
    let hh = i
    if (hh < 10) {
      hh = `0${hh}`
    }
    hourChoices.push(hh + ':' + '00')
    hourChoices.push(hh + ':' + '30')
  }

  function calcPosition () {
    const currentHour = Number(value.split(':')[0])
    const heightPerHour = menuHeight / (end - start)
    return (currentHour - start) * heightPerHour
  }
</script>

<div>
  <!-- instead achieve overflow via the @snippet itself -->
  <!-- menuStyles="overflow-y: auto; height: 360px;" -->
  <PopoverMenu {id}
    {activator} 
    {content}
    bind:this={scrollContainer}
    ontoggle={e => {
      if (e.newState === 'open') {
        const scrollContainer = document.getElementById(id)
        scrollContainer.scrollTo({ top: calcPosition() })
      }
    }}
  />

  {#snippet activator ({ open, popovertarget })}
    <input {value}
      placeholder='Time'
      pattern='[0-9]{2}:[0-9]{2}'
      {oninput}
      onclick={open}                                                                
      class="time-dropdown {fieldWithPlaceholder}"
      style="
        anchor-name: --anchor-{popovertarget};
        height: {fieldHeight};
        padding: 0 {paddingVal};
      "
    />
  {/snippet}

  {#snippet content({ open, close, setPosition, popovertarget })}
    <div class="time-options-grid" use:trackHeight={h => menuHeight = h}>
      {#each hourChoices as hhmm}
        <button onclick={() => { onTimeSelected(hhmm); close(); }}
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
    field-sizing: content;
    text-align: center; 
    border-radius: 4px;
    border: none;
    outline: none;

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
    font-size: 0.875rem;
    color: #727272;
    border-radius: 4px;
  }
</style>
