

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

export function dropPreviewCSS () {
  return `
    background-color: rgba(100, 100, 255, 0.15);
    border: 1px dashed rgba(100, 100, 255, 0.6);
    pointer-events: none;
  `
}