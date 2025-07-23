<script>
  import { DateTime } from 'luxon'
  import { round } from '$lib/utils/core.js'

  export let iso

  function isPast (iso) {
    const dt = DateTime.fromISO(iso)
    return dt.diff(DateTime.now()).as('days') < 0
  }

  function formatRelativeTime (dateStr) {
    if (!dateStr) return 'unscheduled'

    const { days } = DateTime.fromISO(dateStr).diff(DateTime.now(), 'days')
    const wrap = (text) => days < 0 ? `${text} ago` : `in ${text}`
    const d = Math.abs(days)
    
    if (d < 1) return 'today'
    else if (d < 60) return wrap(`${round(d)}d`)
    else if (d < 365) return wrap(`${round(d / 30)}mo`)
    else return wrap(`${round(d / 365)}y`)
  } 
</script>

<button class="date-badge" class:faint={isPast(iso)} on:click on:keydown>
  {formatRelativeTime(iso)}
</button>

<style>  
  .date-badge {
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 12px;
    border: 1px solid black;
    color: black;
    padding: 2px 4px;
    border-radius: 6px;
    text-align: center;
    display: flex;
    align-items: center;
  }

  .faint {
    color: grey;
    border: 1px solid grey;
  }
</style>