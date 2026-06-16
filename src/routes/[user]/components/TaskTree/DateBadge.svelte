<script>
  import { DateTime } from 'luxon'
  import { round } from '$lib/utils/core.js'

  let { iso, onclick } = $props()

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

    const today = DateTime.now().startOf('day')
    const target = DateTime.fromISO(dateStr).startOf('day')
    const days = Math.round(target.diff(today, 'days').days)

    if (days === 0) return 'today'
    if (days === 1) return 'tomorrow'

    const d = Math.abs(days)
    const amount =
      d < 28 ? `${d}d` :
      d < 365 ? `${round(d / 30)}mo` :
      `${round(d / 365)}y`

    return days < 0 ? `${amount} ago` : `in ${amount}`
  } 
</script>

<button class="date-badge" class:faint={(isPast(iso) && !isToday(iso)) || !iso} {onclick}>
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
    background-color: hsla(0, 100%, 0%, 0.6);
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