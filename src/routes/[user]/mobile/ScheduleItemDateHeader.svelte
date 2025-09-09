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
  <div class="date-group">
    {#if isSpecialDay(iso)}
      <span class="day-name">{dayName}</span>
      <span class="date">{MMMdd}</span>
    {:else}
      <span class="date bold">{MMMdd}</span>
      <span class="weekday">{dayOfWeek}</span>
    {/if}
  </div>
</div>

<style>
  .day-header {
    font-size: 24px;
    padding: 14px 16px;
    border-bottom: 1px solid #f1f3f4;
    background: #fff;
  }

  .day-header.section-complete {
    background: linear-gradient(to right, rgba(76, 175, 80, 0.06), transparent 50%);
  }

  .day-header.section-complete .day-name,
  .day-header.section-complete .date.bold {
    color: #1e8e24;
  }

  .day-header.section-complete .date:not(.bold),
  .day-header.section-complete .weekday {
    color: #4caf50;
    opacity: 0.7;
  }

  .day-name {
    color: #1a73e8;
    font-weight: 600;
  }

  .date {
    color: #70757a;
  }

  .date.bold {
    color: #1a73e8;
    font-weight: 600;
  }

  .weekday {
    color: #70757a;
  }

  .date-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
