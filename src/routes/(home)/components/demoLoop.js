export function elementRef (write) {
  return (node) => {
    write(node)
    return () => write(null)
  }
}

export function keyedRefs () {
  const attachments = new Map()
  const nodes = {}
  return {
    nodes,
    attach (key) {
      let attachment = attachments.get(key)
      if (!attachment) {
        attachment = (node) => {
          nodes[key] = node
          return () => {
            if (nodes[key] === node) delete nodes[key]
          }
        }
        attachments.set(key, attachment)
      }
      return attachment
    }
  }
}

export function boxWithin (stage, el) {
  const origin = stage.getBoundingClientRect()
  const box = el.getBoundingClientRect()
  return {
    x: box.left - origin.left,
    y: box.top - origin.top,
    w: box.width,
    h: box.height
  }
}

export function createLoop (steps) {
  let timer = 0
  let stopped = false
  let paused = false
  let i = 0
  let due = 0
  let remaining = 0

  function arm (ms) {
    remaining = ms
    due = performance.now() + ms
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (stopped || paused) return
      tick()
    }, ms)
  }

  function tick () {
    if (stopped || paused) return
    steps[i].run()
    const ms = steps[i].ms
    i = (i + 1) % steps.length
    arm(ms)
  }

  return {
    start () { tick() },
    pause () {
      if (paused || stopped) return
      paused = true
      clearTimeout(timer)
      remaining = Math.max(0, due - performance.now())
    },
    resume () {
      if (!paused || stopped) return
      paused = false
      arm(remaining)
    },
    stop () {
      stopped = true
      clearTimeout(timer)
    }
  }
}

export function setMotionPaused (root, paused) {
  if (!root?.getAnimations) return
  for (const anim of root.getAnimations({ subtree: true })) {
    if (paused) {
      if (anim.playState === 'running') anim.pause()
    } else if (anim.playState === 'paused') {
      anim.play()
    }
  }
}
