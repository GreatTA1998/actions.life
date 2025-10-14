<script>
  import { uniqueEvents } from '$lib/store'
  import { round } from '$lib/utils/core.js'
  import { DateTime } from 'luxon'
  
  let { iso, i } = $props()

  function daysBetween (prevISO, curISO) {
    if (!prevISO || !curISO) return 0
    const prev = DateTime.fromISO(prevISO)
    const cur = DateTime.fromISO(curISO)
    const diff = round(cur.diff(prev, 'days').days)
    return Math.max(0, diff)
  }
</script>

{#if i > 0 && daysBetween(Object.keys($uniqueEvents)[i - 1], iso) > 1}
  <div class="time-gap">
    {daysBetween(Object.keys($uniqueEvents)[i - 1], iso)} days
  </div>
{/if}

<style>
  .time-gap {
    font-size: 16px;
    font-weight: 300;
    text-align: center;
  }
</style>

