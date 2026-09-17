export function lazyCallable (node, callback) {
  const run = () => {
    callback()
  }

  // WKWebView + overflow-hidden ancestors (homepage phone bezel) often never
  // report threshold 0.2 intersections. Fall back to a loose bounding-rect
  // check so calendar photos still paint.
  const rect = node.getBoundingClientRect()
  const vh = window.innerHeight || 0
  const vw = window.innerWidth || 0
  if (rect.bottom > -400 && rect.top < vh + 400 && rect.right > 0 && rect.left < vw) {
    run()
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          run()
          return
        }
      }
    },
    {
      root: null,
      threshold: 0,
      rootMargin: '400px 0px',
    }
  )

  observer.observe(node)

  return {
    destroy () {
      observer.disconnect()
    }
  }
}

export function trackWidth (node, onWidthChange) {
  const ro = new ResizeObserver(entries => {
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

// crazy that boundingClientRect flickers between integers and decimals
export function trackHeight (node, onHeightChange) {
  const ro = new ResizeObserver(entries => {
    const exactHeight = entries[0].contentRect.height
    onHeightChange(exactHeight)
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