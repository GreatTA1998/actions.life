<script>
  import PopoverMenu  from '$lib/components/PopoverMenu.svelte'
  import { trackHeight } from '$lib/utils/svelteActions.js'
  import { randomID } from '$lib/utils/core.js'
  import { paddingVal, placeholderField, noZoomFS } from '$lib/styles/reused.module.css'

  let { 
    value = '',
    onTimeSelected = () => {}
  } = $props()

  const id = randomID()

  let buttonElem = $state(null)
  let inputElem = $state(null)
  let menuHeight = $state(0)

  // Picking from the menu happens while the input still holds focus, so
  // syncExternalValue's focus guard would skip it. Write the field directly.
  function pick (hhmm, close) {
    onTimeSelected(hhmm)
    if (inputElem) inputElem.value = hhmm
    close()
  }

  // reflect external value changes into the field, but never while the user is
  // editing it (that would fight their caret). re-runs whenever `value` changes.
  function syncExternalValue (node) {
    if (document.activeElement !== node) node.value = value ?? ''
  }

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

  const isValid = t => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)

  // The colon is a fixed anchor: digits left of it are always hours, digits
  // right of it are always minutes. Split the raw field into those segments.
  function parse (raw) {
    const i = raw.indexOf(':')
    if (i === -1) return { hh: raw.replace(/\D/g, '').slice(0, 2), mm: '' }
    return {
      hh: raw.slice(0, i).replace(/\D/g, '').slice(0, 2),
      mm: raw.slice(i + 1).replace(/\D/g, '').slice(0, 2)
    }
  }

  // Show the colon once hours are complete or any minutes exist, so an empty
  // hour with minutes still renders as ":mm" (meaning preserved).
  function render (hh, mm) {
    if (mm.length > 0 || hh.length === 2) return hh + ':' + mm
    return hh
  }

  // Locate the caret as (segment, digits-into-segment) so it survives reformatting.
  function caretInfo (raw, caret) {
    const i = raw.indexOf(':')
    if (i === -1 || caret <= i) {
      return { seg: 'h', off: raw.slice(0, caret).replace(/\D/g, '').length }
    }
    return { seg: 'm', off: raw.slice(i + 1, caret).replace(/\D/g, '').length }
  }

  function caretFromInfo (text, { seg, off }) {
    const i = text.indexOf(':')
    if (seg === 'h') return i !== -1 && off >= 2 ? i + 1 : off
    return i === -1 ? text.length : i + 1 + off
  }

  function commit (el, hh, mm, info) {
    const formatted = render(hh, mm)
    el.value = formatted
    const caret = caretFromInfo(formatted, info)
    el.setSelectionRange(caret, caret)
    if (isValid(formatted)) onTimeSelected(formatted)
  }

  function onbeforeinput (e) {
    const el = e.target
    const { selectionStart: s, selectionEnd, value: v } = el
    if (s !== selectionEnd) return // let range edits reflow natively

    // Deleting the colon would scramble hours vs minutes, so intercept it.
    if (e.inputType === 'deleteContentBackward' && v[s - 1] === ':') {
      e.preventDefault()
      const { hh, mm } = parse(v)
      if (hh.length > 0) {
        const next = hh.slice(0, -1)
        commit(el, next, mm, { seg: 'h', off: next.length })
      } else if (mm.length === 0) {
        commit(el, '', '', { seg: 'h', off: 0 })
      }
    } else if (e.inputType === 'deleteContentForward' && v[s] === ':') {
      e.preventDefault()
      const { hh, mm } = parse(v)
      if (mm.length > 0) commit(el, hh, mm.slice(1), { seg: 'm', off: 0 })
    }
  }

  function oninput (e) {
    const el = e.target
    const { hh, mm } = parse(el.value)
    commit(el, hh, mm, caretInfo(el.value, el.selectionStart))
  }
</script>

<PopoverMenu {id}
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
        bind:this={inputElem}
        {@attach syncExternalValue}
        inputmode="numeric"
        {oninput} {onbeforeinput}
        onblur={() => setTimeout(close, 300)}
        placeholder="Time"
        pattern="[0-9]{2}:[0-9]{2}"                                                           
        class={placeholderField}
        style:anchor-name={anchorName}
        style:padding="0 {paddingVal}"
        style:width="{5+0.5}ch"
      />
    </button>
  {/snippet}

  {#snippet content({ close })}
    <div use:trackHeight={h => menuHeight = h}
      class="grid p-1 gap-1 max-h-[240px] overflow-y-auto hide-scrollbar"
      style:grid-template-columns="repeat(2, 1fr)"
    >
      {#each hourChoices as hhmm}
        <button onclick={() => pick(hhmm, close)}
          class={[
            'rounded py-1 px-2', 
            value === hhmm ? 'font-semibold' : 'text-neutral-500'
          ]}
          style:font-size={noZoomFS}
        >
          {hhmm}
        </button>
      {/each}
    </div>
  {/snippet}
</PopoverMenu>