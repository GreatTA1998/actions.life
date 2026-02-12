<script>
  import { isMobile } from '$lib/utils/core.js'
  import { innerHeight } from 'svelte/reactivity/window'
  let {
    onInput = () => {},
    onChange = () => {}
  } = $props()
  
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
    if (isMobile()) return innerHeight.current - e.clientY
    else return e.clientX
  }
</script>

<div class="{isMobile() ? 'w-full' : 'h-full'} relative flex z-1 items-center justify-center touch-none">
  <div {onpointerdown} {onpointermove} {onpointerup} 
    class="absolute flex items-center justify-center z-10 w-[48px] h-[48px] cursor-pointer"
  >
    <div class="inline-flex touch-none" 
      style:view-transition-name="grip-handle"
      style:view-transition-class="static-ui"
    >
      <svg class:rotate={isMobile()} 
        width="12" 
        height="36" 
        viewBox="0 0 12 36" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style="--grip-color: black"
      >
        <rect x="2" y="6" width="0.5" height="24" fill="var(--grip-color)" />
        <rect x="5.75" y="0" width="0.5" height="36" fill="var(--grip-color)" />
        <rect x="9.5" y="6" width="0.5" height="24" fill="var(--grip-color)" />
      </svg>
    </div>
  </div>
</div>

<style>
  .rotate {
    transform: rotate(90deg);
    transform-origin: center;
  }
</style>