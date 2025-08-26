export function startTaskDrag (e, id, { draggedItem, activeDragItem, grabOffset }) {
  if (e.target !== e.currentTarget) return // effectively `click|self`

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