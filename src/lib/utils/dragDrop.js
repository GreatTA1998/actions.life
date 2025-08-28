export function startTaskDrag (e, id, { draggedItem }) {
  if (e.target !== e.currentTarget) return // effectively `click|self`
  // don't call preventDefault(), otherwise drag doesn't even start
  e.stopPropagation() // stops rare occasions where the entire UI gets dragged (which'd be scary)
  e.dataTransfer.setData("text/plain", id) // without this iOS won't activate drag!

  const { top, left, width, height } = e.target.getBoundingClientRect()
  
  draggedItem.update(i => {
    i.x1 = left
    i.y1 = top
    i.x2 = i.x1 + width
    i.y2 = i.y1 + height

    i.width = width
    i.height = height

    i.offsetX = e.clientX - left
    i.offsetY = e.clientY - top

    i.id = id

    return i
  })
  // TO-DO: include the whole task object otherwise treeISOs related logic will fail
}

export function isOverlapping ({ x1, x2, y1, y2 }, { top, left, bottom, right }, h_threshold = 0.3, v_threshold = 0) {
  const hOverlap = Math.max(0, Math.min(x2, right) - Math.max(x1, left))
  const vOverlap = Math.max(0, Math.min(y2, bottom) - Math.max(y1, top))
  return hOverlap / (x2 - x1) > h_threshold && vOverlap / (y2 - y1) > v_threshold
}

export function getOverlapArea ({ x1, x2, y1, y2 }, { top, left, bottom, right }) {
  const hOverlap = Math.max(0, Math.min(x2, right) - Math.max(x1, left))
  const vOverlap = Math.max(0, Math.min(y2, bottom) - Math.max(y1, top))
  return hOverlap * vOverlap
}

export function clip ({ x1, x2, y1, y2 }, { left, right, top, bottom }) {
  return {
    x1: Math.max(x1, left),
    x2: Math.min(x2, right),
    y1: Math.max(y1, top), 
    y2: Math.min(y2, bottom)
  }
}

export function emptyItem () {
  return {
    x1: null,
    y1: null,
    x2: null,
    y2: null,
    offsetX: null,
    offsetY: null,
    width: null,
    height: null,
    id: ''
  }
}

export function dropPreviewCSS () {
  return `
    background: rgba(100, 100, 255, 0.15);
    border: 1px dashed rgba(100, 100, 255, 0.6);
    border-radius: var(--left-padding);
    pointer-events: none;
  `
}