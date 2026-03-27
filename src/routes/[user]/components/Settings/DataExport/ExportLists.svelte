<script>
  import { trees } from '/src/routes/[user]/components/ListsArea/service.js'

  let { onExport } = $props()

  function exportLists () {
    const md = treesToMarkdown($trees)
    onExport(md)
  }

  function treesToMarkdown (treesArray) {
    if (!treesArray || treesArray.length === 0) {
      return '# Lists\n\nNo tasks found.'
    }
    
    let md = '# Lists\n\n'
    for (const rootTask of treesArray) {
      md += formatTaskWithChildren(rootTask, 0)
    }
    return md.trim()
  }

  function formatTaskWithChildren (task, depth = 0) {
    const indent = '  '.repeat(depth)
    const checkbox = task.isDone ? '[x]' : '[ ]'
    const name = task.name || 'Untitled'
    
    const metaParts = []
    if (task.duration) metaParts.push(`${task.duration}min`)
    if (task.startTime) metaParts.push(task.startTime)
    const meta = metaParts.length > 0 ? ` (${metaParts.join(', ')})` : ''
    
    const notes = task.notes ? ` — ${task.notes.replace(/\n/g, ' ')}` : ''
    
    let md = `${indent}- ${checkbox} ${name}${meta}${notes}\n`
    
    if (task.children && task.children.length > 0) {
      const sortedChildren = [...task.children].sort((a, b) => {
        if (a.orderValue !== undefined && b.orderValue !== undefined) {
          return a.orderValue - b.orderValue
        }
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime)
        }
        return 0
      })
      
      for (const child of sortedChildren) {
        md += formatTaskWithChildren(child, depth + 1)
      }
    }
    
    return md
  }
</script>

<button class="export-btn" onclick={exportLists}>
  Export lists
</button>

<style>
  .export-btn {
    width: 120px;
    padding: 8px 16px;
    background-color: grey;
    color: white;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.875rem;
  }
</style>

