<script>
  import { isMobile, getLocalX, getLocalY } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  let {
    onInput = () => {},
    onChange = () => {}
  } = $props()

  let dimensions = getContext('dimensions')
  let { height, appDiv } = $derived(dimensions)
  
  let resizing = false

  function onpointerdown (e) {
    e.stopPropagation()
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId) // ensure the event fires even if moved outside the window
    resizing = true
  }

  function onpointermove (e) {
    if (resizing) onInput(axisValue(e))
  }

  function onpointerup (e) {
    if (e.target.hasPointerCapture(e.pointerId)) { 
      e.target.releasePointerCapture(e.pointerId)
    }
    if (resizing) onChange(axisValue(e))
    resizing = false
  }

  function axisValue (e) {
    if (isMobile()) return height - getLocalY(appDiv, e.clientY)
    else return getLocalX(appDiv, e.clientX)
  }
</script>

<div class="{isMobile() ? 'w-full' : 'h-full'} relative flex z-1 items-center justify-center touch-none">
  <div {onpointerdown} {onpointermove} {onpointerup} 
    class="size-12 absolute flex items-center justify-center z-10 cursor-pointer"
  >
    <div class="inline-flex touch-none" 
      style:view-transition-name="grip-handle"
      style:view-transition-class="static-ui"
    >
      <svg
        viewBox="0 0 12 36" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        class={[
          'grip-icon w-3 h-9',
          isMobile() && 'rotate-90'
        ]}
        style="--grip-color: black"
      >
        <rect x="2" y="6" width="1" height="24" fill="var(--grip-color)" />
        <rect x="5.75" y="0" width="1" height="36" fill="var(--grip-color)" />
        <rect x="9.5" y="6" width="1" height="24" fill="var(--grip-color)" />
      </svg>
    </div>
  </div>
</div>