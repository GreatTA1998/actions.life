export function lazyCallable (node, callback) {
  let observer = new IntersectionObserver(
    (entries) => {
      // for some god damn reason the callbacks fire on initialization, even when there is no intersection,
      // so we have to check manually
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (callback()) {
            observer.unobserve(node);
          }
          return;
        }
      }
    },
    {
      root: null, // use viewport as root
      threshold: 0.2,
      rootMargin: "0px", // shrink/expand the root element's area, not very useful
    }
  );

  observer.observe(node)
}

export function trackWidth (node, onWidthChange) {
  const ro = new ResizeObserver((entries) => {
    const exactWidth = entries[0].contentRect.width
    onWidthChange(exactWidth)
    
    // crazy that boundingClientRect flickers between integers and decimals
  })
  
  ro.observe(node)
  
  return {
    destroy() {
      ro.disconnect()
    },
    
    // Allow updating the callback
    update(newCallback) {
      onWidthChange = newCallback
    }
  }
}

export function trackHeight (node, onHeightChange) {
  const ro = new ResizeObserver((entries) => {
    const exactHeight = entries[0].contentRect.height
    onHeightChange(exactHeight)

    // crazy that boundingClientRect flickers between integers and decimals
  })
  
  ro.observe(node)
  
  return {
    destroy() {
      ro.disconnect()
    },
    
    // Allow updating the callback
    update(newCallback) {
      onHeightChange = newCallback
    }
  }
}

/** Dispatch event on click outside of node */
export function clickOutside (node) {
  const handleClick = event => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      node.dispatchEvent(
        new CustomEvent('click_outside', node)
      )
    }
  }
  document.addEventListener('click', handleClick, true)
  
  return {
    destroy() {
      document.removeEventListener('click', handleClick, true)
    }
  }
} 