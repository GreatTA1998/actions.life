<script>
  import { activePopoverClose, isInputActive } from '$lib/store'

  let { activator, content } = $props()

  let popoverElem = $state(null)
  let activatorWrapper = $state(null)
  let activatorElem = $state(null)
  // Generate a unique anchor name once per component instance
  const anchorName = `popover-anchor-${Math.random().toString(36).substr(2, 9)}`
  let supportsAnchorPositioning = $state(false)
  let isPopoverOpen = $state(false)


  // Check for anchor positioning support
  $effect(() => {
    if (typeof CSS !== 'undefined' && CSS.supports) {
      supportsAnchorPositioning = CSS.supports('anchor-name', '--test')
    }
  })

  // Find the actual activator element (first child of wrapper) and set anchor-name
  $effect(() => {
    if (activatorWrapper) {
      activatorElem = activatorWrapper.firstElementChild || activatorWrapper
      if (activatorElem && supportsAnchorPositioning) {
        // Set anchor-name CSS property
        activatorElem.style.setProperty('anchor-name', `--${anchorName}`)
      }
    }
  })

  // Handle popover being closed by clicking outside (HTML popover API)
  $effect(() => {
    if (!popoverElem) return
    
    function handleToggle(e) {
      isPopoverOpen = popoverElem.matches(':popover-open')
      // If popover is being hidden (not shown)
      if (!isPopoverOpen) {
        // Clear the active popover if this one was active
        if ($activePopoverClose === close) {
          activePopoverClose.set(null)
          isInputActive.set(false)
        }
      }
    }
    
    popoverElem.addEventListener('toggle', handleToggle)
    
    return () => {
      popoverElem.removeEventListener('toggle', handleToggle)
    }
  })

  async function toggle () {
    if (popoverElem.matches(':popover-open')) {
      popoverElem.hidePopover()
      isPopoverOpen = false
    } else {
      if (!supportsAnchorPositioning) {
        updateFallbackPosition()
      }
      popoverElem.showPopover()
      isPopoverOpen = true
    }
  }

  function open (e) {
    // Close any existing active popover first
    const currentClose = $activePopoverClose
    if (currentClose && currentClose !== close) {
      currentClose()
    }
    
    if (!supportsAnchorPositioning) {
      updateFallbackPosition()
    }
    
    popoverElem.showPopover()
    isPopoverOpen = true
    activePopoverClose.set(close)
  }

  function close () {
    popoverElem.hidePopover()
    isPopoverOpen = false
    // Clear the active popover if this one was active
    if ($activePopoverClose === close) {
      activePopoverClose.set(null)
      isInputActive.set(false)
    }
  }

  // Fallback positioning for browsers without anchor positioning support
  let fallbackPosition = $state({ x: 0, y: 0, width: 0, height: 0 })
  
  function updateFallbackPosition() {
    if (!activatorElem || supportsAnchorPositioning) return
    
    const rect = activatorElem.getBoundingClientRect()
    fallbackPosition = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    }
  }

  $effect(() => {
    if (!supportsAnchorPositioning && activatorElem && popoverElem && isPopoverOpen) {
      updateFallbackPosition()
      
      const handleScroll = () => {
        if (isPopoverOpen) {
          updateFallbackPosition()
        }
      }
      const handleResize = () => {
        if (isPopoverOpen) {
          updateFallbackPosition()
        }
      }
      
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleResize)
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', handleResize)
      }
    }
  })
</script>

<div bind:this={activatorWrapper} style="display: contents;">
  {@render activator({ open, close, toggle })}
</div>

<div bind:this={popoverElem}
  popover="auto"
  class="popover-input-container"
  style={supportsAnchorPositioning 
    ? `position-anchor: --${anchorName}; position: fixed; top: anchor(top); left: anchor(left); width: anchor(width); height: anchor(height); margin: 0; padding: 0; z-index: 1000; box-sizing: border-box;`
    : `position: fixed; left: ${fallbackPosition.x}px; top: ${fallbackPosition.y}px; width: ${fallbackPosition.width}px; height: ${fallbackPosition.height}px; margin: 0; padding: 0; z-index: 1000; box-sizing: border-box;`
  }
>
  {@render content?.({ open, close, toggle })}
</div>

<style>
  .popover-input-container {
    background: white;
    border-radius: var(--left-padding);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: none;
    overflow: hidden;
  }
</style>