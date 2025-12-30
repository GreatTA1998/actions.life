<script>
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  let { onExport, startDate, endDate } = $props()
  
  let loading = $state(false)

  async function exportCalendar() {
    try {
      loading = true
      let tasks = await Task.getByDateRange(startDate, endDate)
      const FIELDS = ['name', 'isDone', 'duration', 'startDateISO', 'startTime', 'notes']
      tasks = tasks.map(task => Object.fromEntries(FIELDS.map(f => [f, task[f]])))
      const md = formatAsMarkdown(tasks)
      onExport(md)
    } finally {
      loading = false
    }
  }

  function formatAsMarkdown (tasks) {
    const byDate = {}
    for (const t of tasks) {
      const date = t.startDateISO || 'Unscheduled'
      if (!byDate[date]) byDate[date] = []
      byDate[date].push(t)
    }

    const sortedDates = Object.keys(byDate).sort()

    let md = '# Calendar\n\n'
    for (const date of sortedDates) {
      md += `## ${date}\n\n`
      
      const sorted = byDate[date].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
      
      for (const t of sorted) {
        const checkbox = t.isDone ? '[x]' : '[ ]'
        const time = t.startTime ? `, ${t.startTime}` : ''
        const duration = t.duration ? `${t.duration}min` : ''
        const meta = [duration, time.slice(2)].filter(Boolean).join(', ')
        const notes = t.notes ? ` — ${t.notes.replace(/\n/g, ' ')}` : ''
        
        md += `- ${checkbox} ${t.name || 'Untitled'}`
        if (meta) md += ` (${meta})`
        if (notes) md += notes
        md += '\n'
      }
      md += '\n'
    }

    return md.trim()
  }
</script>

<button class="export-btn" onclick={exportCalendar} disabled={loading}>
  {loading ? 'Exporting...' : 'Export calendar'}
</button>


<style>
  .calendar-export {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .export-btn {
    padding: 8px 16px;
    background-color: #7c3aed;
    color: white;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.875rem;
    width: 140px;
  }

  .export-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

