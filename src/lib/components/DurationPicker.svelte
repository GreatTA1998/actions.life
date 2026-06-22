<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import { paddingVal, noZoomFS, placeholderField } from '$lib/styles/reused.module.css'

  let { value, oninput } = $props()

  let button = $state(null)
  let inputElem = $state(null)

  const MIN_MINUTES = 1
  const MAX_DIGITS = 3

  const toMinutes = v => Math.max(MIN_MINUTES, Math.floor(Number(v)) || MIN_MINUTES)

  const emit = minutes => oninput?.({ target: { value: minutes } })

  // Mirror the external value into the field, but never while it's being edited
  // (that would fight the user's caret).
  function syncExternalValue (node) {
    if (document.activeElement !== node) node.value = toMinutes(value)
  }

  // Keep only digits as the user types. An empty field emits '' so the parent
  // knows it's mid-edit; the blur handler then enforces the minimum.
  function onInput (e) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, MAX_DIGITS)
    e.target.value = digits
    emit(digits === '' ? '' : Number(digits))
  }

  function onBlur (e, close) {
    if (Number(e.target.value) < MIN_MINUTES) {
      e.target.value = MIN_MINUTES
      emit(MIN_MINUTES)
    }
    setTimeout(close, 300)
  }

  const durations = [
    { label: '1m', value: 1 },
    { label: '2m', value: 2 },
    { label: '5m', value: 5 },
    { label: '10m', value: 10 },
    { label: '15m', value: 15 },
    { label: '20m', value: 20 },
    { label: '30m', value: 30 },
    { label: '40m', value: 40 },
    { label: '50m', value: 50 },
    { label: '60m', value: 60 },
    { label: '90m', value: 90 },
    { label: '120m', value: 120 },
  ];

  // The input still holds focus when a menu item is clicked, so
  // syncExternalValue's focus guard would skip it. Write the field directly.
  function select (duration, close) {
    emit(duration.value)
    if (inputElem) inputElem.value = duration.value
    close()
  }
</script>

<PopoverMenu>
  {#snippet activator({ id, anchorName, close })}
    <button bind:this={button}
      popovertarget={id}
      style:anchor-name={anchorName}
      style:padding="0px {paddingVal}"
      style:font-size={noZoomFS}
      style:column-gap="1px"
    >
      <input onclick={() => button.click()}
        bind:this={inputElem}
        {@attach syncExternalValue}
        inputmode="numeric"
        oninput={onInput}
        onblur={e => onBlur(e, close)}
        class={[placeholderField, 'text-right focus:border-[#007bff]']}
        style:field-sizing="content"
        style:padding="0"
      >
      <span class="pointer-events-none">m</span>
    </button>
  {/snippet}

  {#snippet content({ close })}
    <div class="grid gap-2 p-2" style:grid-template-columns="repeat(3, 1fr)">
      {#each durations as duration}
        <button onclick={() => select(duration, close)}
          class={[
            'rounded py-2 px-3', 
            placeholderField,
            value === duration.value ? 'font-semibold' : `text-neutral-500`
          ]}
        >
          {duration.label}
        </button>
      {/each}
    </div>
  {/snippet}
</PopoverMenu>