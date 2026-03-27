<script>
  import PopoverMenu  from '$lib/components/PopoverMenu.svelte'
  import { trackHeight } from '$lib/utils/svelteActions.js'
  import { getRandomID } from '$lib/utils/core.js'
  import { paddingVal, placeholderField, fieldGrey, noZoomFS } from '$lib/styles/reused.module.css'

  let { 
    value = '',
    onTimeSelected = () => {}
  } = $props()

  const id = getRandomID()

  let buttonElem = $state(null)
  let scrollContainer = $state(null)
  let menuHeight = $state(0)

  const start = 8
  const end = 21

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

  function validateTime (e) {
    const { value } = e.target
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
      onTimeSelected(value)
    } 
    else if (/^([01]\d|2[0-3])([0-5]\d)$/.test(value)) {
      const formatted = value.slice(0, 2) + ':' + value.slice(2)
      onTimeSelected(formatted)
    }
  }
</script>

<PopoverMenu {id}
  bind:this={scrollContainer}
  ontoggle={e => {
    if (e.newState === 'open') {
      const scrollContainer = document.getElementById(id)
      scrollContainer.scrollTo({ top: calcPosition() })
    }
  }}
>
  {#snippet activator ({ id, anchorName, close })}
    <button popovertarget={id} bind:this={buttonElem}>
      <input onclick={() => buttonElem.click()}    
        inputmode="numeric"
        {value} oninput={validateTime}
        onblur={() => setTimeout(close, 300)}
        placeholder="Time"
        pattern="[0-9]{2}:[0-9]{2}"                                                           
        class={placeholderField}
        style:anchor-name={anchorName}
        style:padding="0 {paddingVal}"
        style:field-sizing="content"
      />
    </button>
  {/snippet}

  {#snippet content({ close })}
    <div use:trackHeight={h => menuHeight = h}
      class="grid p-1 gap-1 max-h-[240px] overflow-y-auto hide-scrollbar"
      style:grid-template-columns="repeat(2, 1fr)"
    >
      {#each hourChoices as hhmm}
        <button onclick={() => { onTimeSelected(hhmm); close(); }}
          class="rounded py-1 px-2" 
          style:color={fieldGrey}
          style:font-size={noZoomFS}
          class:highlighted-option={value === hhmm}
        >
          {hhmm}
        </button>
      {/each}
    </div>
  {/snippet}
</PopoverMenu>
