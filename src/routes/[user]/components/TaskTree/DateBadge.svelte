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

<button {onclick} 
  class={[
    'text-xs whitespace-nowrap shrink-0 py-[2px] px-[4px] rounded-[6px]',
    'text-center flex items-center',
    ((isPast(iso) && !isToday(iso)) || !iso)
      ? 'bg-[rgb(231,231,231)] text-[grey]'
      : 'bg-[hsla(0,100%,0%,0.6)] text-white'
  ]}
>
  {formatRelativeTime(iso)}
</button>
