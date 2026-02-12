<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import DatePicker from './DatePicker.svelte'
  import { paddingVal, placeholderField } from '$lib/styles/reused.module.css'
  import { DateTime } from 'luxon'

  let {
    startDateISO = '',
    onChange = () => {}
  } = $props()

  let button = $state(null)
</script>

<PopoverMenu>
  {#snippet activator({ id, anchorName })}
    <button bind:this={button} popovertarget={id} style:anchor-name={anchorName}>
      <input onclick={() => button.click()} 
        readonly 
        value={startDateISO}
        placeholder="Year and Date" 
        class="input {placeholderField} rounded min-w-[80px]" 
        style:padding="0 {paddingVal}"
        style:field-sizing="content"
      >
    </button>
  {/snippet}

  {#snippet content({ close })}
    <DatePicker
      valueDT={startDateISO ? DateTime.fromISO(startDateISO) : null}
      {onChange}
      onclose={close}
    />
  {/snippet}
</PopoverMenu>
