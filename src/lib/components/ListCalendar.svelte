<script>
  import ResizeBoundary from '$lib/components/ResizeBoundary.svelte'
  import ListArea from '$lib/components/ListArea.svelte'
  import Calendar from '/src/routes/[user]/components/Calendar/Calendar.svelte'
  import User from '$lib/db/models/User.js'
  import { isMobile } from '$lib/utils/core.js'
  import { MOBILE_SAFE_INSET } from '$lib/utils/constants.js'
  import { innerWidth, innerHeight } from 'svelte/reactivity/window'
  import { user } from '$lib/store'

  let axisL = $derived(isMobile() ? listAreaH : listAreaW) // since Svelte 5.25, derived is writable
  let listAreaH = $derived(safe(($user.listHeightSplit ?? 0.5) * innerHeight.current))
  let listAreaW = $derived(safe(($user.listWidthSplit ?? 0.5) * innerWidth.current))

  function updateSizing (newVal) {
    if (isMobile()) {
      User.update({ listHeightSplit: safe(newVal) / innerHeight.current })
    } else {
      User.update({ listWidthSplit: safe(newVal) / innerWidth.current })
    }
  }

  function safe (val) {
    if (isMobile()) {
      return clamp(MOBILE_SAFE_INSET, val, innerHeight.current)
    } else {
      return clamp(0, val, innerWidth.current)
    }
  }

  function clamp (min, val, max) {
    return Math.min(max, Math.max(min, val))
  }
</script>

<div style:flex-direction={isMobile() ? 'column-reverse' : 'row'}
  class="w-full h-full relative flex overflow-hidden" 
>
  <div style:flex="0 0 {axisL}px" class="relative z-1">    
    <ListArea xyScrolling={!isMobile()} />
  </div>
  
  <ResizeBoundary
    onChange={newVal => updateSizing(newVal)}
    onInput={newVal => axisL = safe(newVal)}
  />

  <div style:flex="1 1 0%">
    <Calendar />
  </div>
</div>
