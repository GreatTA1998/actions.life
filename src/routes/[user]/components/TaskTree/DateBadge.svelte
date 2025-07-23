<script>
  import { DateTime } from 'luxon'
  import { round } from '$lib/utils/core.js'

  export let iso

  function isPast (iso) {
    const dt = DateTime.fromISO(iso)
    return dt.diff(DateTime.now()).as('days') < 0
  }

  function isToday (iso) {
    const dt = DateTime.fromISO(iso)
    return dt.toFormat('yyyy-MM-dd') === DateTime.now().toFormat('yyyy-MM-dd')
  }

  function formatRelativeTime (dateStr) {
    if (!dateStr) return 'select date'

    const d1 = DateTime.now()
    const d2 = DateTime.fromISO(dateStr)
    const { days } = d2.diff(d1, 'days')
    const wrap = (text) => days < 0 ? `${text} ago` : `in ${text}`
    const d = Math.abs(days)
    
    if (d < 1) return 'today'
    else if (d < 60) return wrap(`${round(d)}d`)
    else if (d < 365) return wrap(`${round(d / 30)}mo`)
    else return wrap(`${round(d / 365)}y`)
  } 
</script>

<button class="date-badge" class:faint={(isPast(iso) && !isToday(iso)) || !iso} on:click on:keydown>
  {formatRelativeTime(iso)}
</button>

<style>  
  :global(:root) {
    /* matches recursive task's text color */
    --clear-color: rgb(80, 80, 80); 
  }

  .date-badge {
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 12px;
    background-color: var(--experimental-black);
    color: white;
    padding: 2px 4px;
    border-radius: 6px;
    text-align: center;
    display: flex;
    align-items: center;
  }

  .faint {
    background-color: rgb(231, 231, 231);
    color: grey;
  }
</style>