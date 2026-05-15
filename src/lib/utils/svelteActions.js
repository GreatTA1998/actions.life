export function fieldSizingContent (node) {
  const update = () => {
    const usingPlaceholder = !node.value && !!node.placeholder
    const raw = node.value || node.placeholder
    const text = raw || '\u200b'

    const span = document.createElement('span')
    span.textContent = text
    Object.assign(span.style, {
      position: 'absolute',
      visibility: 'hidden',
      whiteSpace: 'pre',
      left: '-9999px',
      top: '0',
      pointerEvents: 'none',
    })

    const inputCS = getComputedStyle(node)
    if (usingPlaceholder) {
      try {
        const phCS = getComputedStyle(node, '::placeholder')
        span.style.font = phCS.font
        span.style.letterSpacing = phCS.letterSpacing
        span.style.fontFeatureSettings = phCS.fontFeatureSettings
      } catch {
        span.style.font = inputCS.font
        span.style.letterSpacing = inputCS.letterSpacing
      }
    } else {
      span.style.font = inputCS.font
      span.style.letterSpacing = inputCS.letterSpacing
    }

    document.body.appendChild(span)
    const textWidth = span.getBoundingClientRect().width
    span.remove()

    const padL = parseFloat(inputCS.paddingLeft) || 0
    const padR = parseFloat(inputCS.paddingRight) || 0
    const borderL = parseFloat(inputCS.borderLeftWidth) || 0
    const borderR = parseFloat(inputCS.borderRightWidth) || 0
    const total = textWidth + padL + padR + borderL + borderR

    const widthPx =
      usingPlaceholder
        ? Math.ceil(total) + 2
        : Math.max(0, Math.round(total))

    node.style.width = `${widthPx}px`
  }
  node.addEventListener('input', update)
  node.addEventListener('change', update)
  update()

  return {
    destroy: () => {
      node.removeEventListener('input', update)
      node.removeEventListener('change', update)
    }
  }
}

export function lazyCallable (node, callback) {
  let observer = new IntersectionObserver(
    (entries) => {
      // for some god damn reason the callbacks fire on initialization, even when there is no intersection,
      // so we have to check manually
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (callback()) {
            // observer.unobserve(node)
          }
          return
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