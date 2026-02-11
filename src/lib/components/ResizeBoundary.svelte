<script>
  import { isMobile } from '$lib/utils/core.js'
  import { innerHeight } from 'svelte/reactivity/window'

  let {
    onInput = () => {},
    onChange = () => {}
  } = $props()
  
  let resizing = $state(false)

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
    if (!isMobile()) return e.clientX
    else if (isMobile()) return innerHeight.current - e.clientY
  }
</script>

<div class="{isMobile() ? 'w-full' : 'h-full'} relative flex z-1 items-center justify-center touch-none">
  <div class="resize-handle flex items-center justify-center z-10" 
    style={isMobile() ? 'height: 0; width: fit-content' : 'height: fit-content; width: 0'}>
    <div {onpointerdown} {onpointermove} {onpointerup}  
      class="absolute inline-flex cursor-pointer touch-none" 
      style:view-transition-name="grip-handle"
      style:view-transition-class="static-ui"
    >
      {#if isMobile()}
        <!-- horizontal triple lines-->
        <svg width="36" height="12" viewBox="0 0 36 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="2" width="24" height="0.5" fill="var(--grip-color)" />
          <rect x="0" y="5.75" width="36" height="0.5" fill="var(--grip-color)" />
          <rect x="6" y="9.5" width="24" height="0.5" fill="var(--grip-color)" />
        </svg>
      {:else}
        <!-- vertical triple lines -->
        <svg width="12" height="36" viewBox="0 0 12 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="6" width="0.5" height="24" fill="var(--grip-color)" />
          <rect x="5.75" y="0" width="0.5" height="36" fill="var(--grip-color)" />
          <rect x="9.5" y="6" width="0.5" height="24" fill="var(--grip-color)" />
        </svg>
      {/if}
    </div>
  </div>
</div>

<style>
  :root {
    --grip-color: black;
  }
</style>