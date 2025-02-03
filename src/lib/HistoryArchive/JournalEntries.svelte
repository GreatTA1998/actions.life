<script>
  import { formatDate } from '/src/helpers/everythingElse.js'

  export let selectedRoutine = null
  export let routineInstances = null
  
  function calculateGap(currentDate, nextDate) {
    if (!nextDate) return 'normal'
    
    const daysDiff = Math.floor((new Date(currentDate) - new Date(nextDate)) / (1000 * 60 * 60 * 24))
    
    if (daysDiff < 1) return 'tight'      // Same day
    if (daysDiff < 3) return 'normal'     // Within 3 days
    if (daysDiff < 14) return 'wide'      // Within 2 weeks
    if (daysDiff < 45) return 'wider'     // Within 1.5 months
    return 'widest'                       // More than 1.5 months
  }

  function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60
    
    if (hours === 0) {
      return `${remainingMins} mins`
    }
    if (remainingMins === 0) {
      return `${hours} hr${hours > 1 ? 's' : ''}`
    }
    return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMins} mins`
  }

  export function formatTime(timeStr) {
    if (!timeStr) return 'N/A'
    const [hours, minutes] = timeStr.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12  // converts 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  function formatTimeGap(currentDate, nextDate) {
    const daysDiff = Math.floor((new Date(currentDate) - new Date(nextDate)) / (1000 * 60 * 60 * 24))
    
    if (daysDiff < 7) return `${daysDiff} days`
    if (daysDiff < 30) return `${Math.floor(daysDiff/7)} weeks`
    if (daysDiff < 365) return `${Math.floor(daysDiff/30)} months`
    return `${Math.floor(daysDiff/365)} years`
  }
</script>

<h2>
  {#if selectedRoutine.iconURL}
    <img src={selectedRoutine.iconURL} alt={selectedRoutine.name} />
  {:else}
    {selectedRoutine.name}
  {/if}
</h2>

<div class="journal-entries">
  {#if routineInstances}
    {#each routineInstances as instance, i (instance.id)}
      <div class="entry-wrapper" data-gap={calculateGap(
        instance.startDateISO, 
        routineInstances[i + 1]?.startDateISO
      )}>
        <div class="journal-entry">
          <div class="journal-entry-header">
            <div class="date-time">
              <span class="date">{formatDate(instance.startDateISO)}</span>
              <span class="time">{formatTime(instance.startTime)}</span>
            </div>
            <div class="duration">{formatDuration(instance.duration)}</div>
          </div>
          <div class="journal-entry-notes">
            {#if instance.imageDownloadURL}
              <img src={instance.imageDownloadURL} alt="Task" />
            {/if}

            {instance.notes || ''}
          </div>
        </div>
        
        {#if routineInstances[i + 1]}
          <div class="time-gap-container">
            <div class="time-gap-indicator"></div>
            <div class="time-gap-label">
              {formatTimeGap(instance.startDateISO, routineInstances[i + 1].startDateISO)}
            </div>
            <div class="time-gap-indicator"></div>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<style>
  .journal-entries {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .entry-wrapper {
    margin-bottom: var(--gap-size);
  }

  /* Time-based gap sizes - reduced spacing */
  .entry-wrapper[data-gap="tight"] {
    --gap-size: 12px;
  }
  .entry-wrapper[data-gap="normal"] {
    --gap-size: 16px;
  }
  .entry-wrapper[data-gap="wide"] {
    --gap-size: 32px;
  }
  .entry-wrapper[data-gap="wider"] {
    --gap-size: 48px;
  }
  .entry-wrapper[data-gap="widest"] {
    --gap-size: 64px;
  }

  /* Show zigzag for wide gaps and above */
  .entry-wrapper[data-gap="wide"] .time-gap-indicator,
  .entry-wrapper[data-gap="wider"] .time-gap-indicator,
  .entry-wrapper[data-gap="widest"] .time-gap-indicator {
    opacity: 1;
    margin: 12px 0;
  }

  .time-gap-container {
    position: relative;
    height: 20px;
    width: 100%;
    opacity: 0;
    transition: opacity 0.2s ease;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 12px;
  }

  .time-gap-indicator {
    height: 1px;
    width: 100%;
    background-color: #ddd;
  }

  .time-gap-label {
    font-size: 0.85em;
    color: #666;
    white-space: nowrap;
  }

  /* Show container for wide gaps and above */
  .entry-wrapper[data-gap="wide"] .time-gap-container,
  .entry-wrapper[data-gap="wider"] .time-gap-container,
  .entry-wrapper[data-gap="widest"] .time-gap-container {
    opacity: 1;
    margin: 8px 0;
  }

  .journal-entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .date-time {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .date {
    font-weight: 500;
  }

  .time {
    color: #666;
  }

  .duration {
    font-size: 0.9em;
    color: #666;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .journal-entry-notes {
    color: rgb(55, 55, 55);
    line-height: 1.5;
  }
</style>