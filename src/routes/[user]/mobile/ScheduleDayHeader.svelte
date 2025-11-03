<script>
  import { DateTime } from 'luxon'

  let { iso, completionState } = $props()

  let MMMdd = $derived(DateTime.fromISO(iso).toFormat('MMM dd'))
  let dayOfWeek = $derived(DateTime.fromISO(iso).toFormat('EEE'))
  let dayName = $derived(getDayName(iso))

  function isSpecialDay (dateStr) {
    const today = DateTime.now().toFormat('yyyy-MM-dd')
    const tomorrow = DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd')
    const yesterday = DateTime.now().minus({ days: 1 }).toFormat('yyyy-MM-dd')
    
    return dateStr === today || dateStr === tomorrow || dateStr === yesterday
  }

  function getDayName (dateStr) {
    const today = DateTime.now().toFormat('yyyy-MM-dd')
    const tomorrow = DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd')
    const yesterday = DateTime.now().minus({ days: 1 }).toFormat('yyyy-MM-dd')
    
    if (dateStr === today) return 'Today'
    if (dateStr === tomorrow) return 'Tomorrow'
    if (dateStr === yesterday) return 'Yesterday'
    else return DateTime.fromISO(dateStr).toFormat('EEE')
  }
</script>

<div class="day-header" class:section-complete={completionState.all}>
  {#if isSpecialDay(iso)}
    <span class="blue-bold">{dayName}</span>
    <span class="black">{MMMdd}</span>
  {:else}
    <span class="blue-bold">{MMMdd}</span>
    <span class="black">{dayOfWeek}</span>
  {/if}
</div>

<style>
  .day-header {
    font-size: 30px;
    padding: 12px 8px;
    border-bottom: 1px solid #f1f3f4;

    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-complete {
    background: linear-gradient(to right, rgba(76, 175, 80, 0.06), transparent 50%);
    color: #1e8e24;
  }

  .blue-bold {
    color: #1a73e8;
    font-weight: 600;
  }

  .black {
    color: black;
  }
</style>
