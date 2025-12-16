<script>
  import GripHandle from '$lib/components/GripHandle.svelte'
  import { getContext } from 'svelte'

  let { 
    orientation = 'horizontal',
    ratioDbField = 'listAreaWidthRatio', // listAreaHeightRatio
    child1,
    child2
  } = $props()

  const { user, User } = getContext('app')
  
  let resizing = false
  let containerLength = $state(orientation === 'horizontal' ? window.innerWidth : window.innerHeight)
  let div1AxisLength = $state($user[ratioDbField] * 100 * containerLength)

  function onpointerdown (e) {
    e.stopPropagation()
    e.preventDefault()
    resizing = true
  }

  function onpointermove (e) {
    if (resizing) {
      div1AxisLength = Math.min(axisValue(e), containerLength)
    }
  }

  function onpointerup (e) {
    resizing = false
    const kvChanges = {}
    kvChanges[ratioDbField] = (div1AxisLength / containerLength) / 100
    User.update(kvChanges)
  }

  function axisValue (e) {
    return orientation === 'horizontal' ? e.clientX : e.clientY
  }
</script>

<div class="relative flexbox overflow-hidden w-full h-full" 
  style:flex-direction={orientation === 'horizontal' ? 'row' : 'column'}
  {onpointermove}
  {onpointerup}
>
  <div class="div-1 min-w-0 min-h-0" 
    style="flex: 0 0 {div1AxisLength}px;"
  >    
    {@render child1()}
  </div>
  
  <div class="relative flexbox z-1 content-center touch-none"
    class:h-full={orientation === 'horizontal'}
    class:w-full={orientation === 'vertical'}
  >
    <GripHandle {onpointerdown} 
      {orientation} 
    />
  </div>

  <div style="flex: 1; min-height: 0; min-width: 0;">
    {@render child2()}
  </div>
</div>