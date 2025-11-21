<script>
  import { formatDate } from '/src/lib/utils/core.js'
  import { openTaskPopup } from '/src/lib/store'

  export let routineInstances = null
  export let selectedRoutine = null
  export let showIcon = true

  function calculateGapSize(currentDate, nextDate) {
    if (!currentDate || !nextDate) return 32
    
    const daysDiff = Math.floor((new Date(currentDate) - new Date(nextDate)) / (1000 * 60 * 60 * 24))
    
    if (daysDiff < 1) return 24
    if (daysDiff < 3) return 32
    if (daysDiff < 7) return 48
    if (daysDiff < 14) return 64
    if (daysDiff < 30) return 96
    if (daysDiff < 45) return 128
    if (daysDiff < 90) return 192
    return 256
  }

  function formatDuration(minutes) {
    if (!minutes) return ''
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
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return ''
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }


  function hasContent(instance) {
    return !!(instance.notes?.trim() || instance.imageDownloadURL)
  }

  $: filteredInstances = routineInstances?.filter(hasContent) || []
</script>

<div class="main-content">
  <div class="journal-entries">
    {#if filteredInstances.length > 0}
      {#each filteredInstances as instance, i (instance.id)}
        {@const nextInstance = filteredInstances[i + 1]}
        {@const gapSize = calculateGapSize(instance.startDateISO, nextInstance?.startDateISO)}
        <div 
          on:click={() => openTaskPopup(instance)} 
          class="entry-wrapper" 
          style="margin-bottom: {gapSize}px;"
        >
          <div class="journal-entry">
            <div class="journal-entry-header">
              <div class="date-time">
                <span class="date">{formatDate(instance.startDateISO)}</span>
                {#if instance.startTime}
                  <span class="time">{formatTime(instance.startTime)}</span>
                {/if}
              </div>
              {#if instance.duration}
                <div class="duration">{formatDuration(instance.duration)}</div>
              {/if}
            </div>
            <div class="journal-entry-notes">
              {#if instance.imageDownloadURL}
                <img src={instance.imageDownloadURL} alt="Task" style="height: 300px; width: auto;" />
              {/if}
              {instance.notes || ''}
            </div>
          </div>
        </div>
      {/each}
    {:else if routineInstances && routineInstances.length === 0}
      <div class="empty-state">
        <p>No instances yet</p>
      </div>
    {:else if routineInstances && filteredInstances.length === 0}
      <div class="empty-state">
        <p>No entries with notes or images</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .journal-entries {
    --timeline-left: 4px;
    --content-padding-left: 16px;
    --content-start: calc(var(--timeline-left) + var(--content-padding-left));
    
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
  }

  .journal-entries::before {
    content: '';
    position: absolute;
    left: var(--timeline-left);
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #ddd;
  }

  .entry-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
    cursor: pointer;
  }

  .entry-wrapper:hover {
    opacity: 0.8;
  }

  .journal-entry {
    width: 100%;
    padding-left: var(--content-start);
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .journal-entry::before {
    content: '';
    position: absolute;
    left: calc(var(--timeline-left) + 1px);
    top: 15px;
    width: 8px;
    height: 8px;
    background: white;
    border: 2px solid #666;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .journal-entry-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    position: relative;
    min-height: 24px;
    padding-top: 4px;
  }

  .date-time {
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 1.2;
  }

  .date {
    font-weight: 500;
  }

  .time {
    color: #666;
  }

  .duration {
    position: absolute;
    right: 0;
    font-size: 0.9em;
    color: #666;
    border-radius: 4px;
  }

  .journal-entry-notes {
    color: rgb(55, 55, 55);
    line-height: 1.6;
    padding-right: 20px;
    display: flex; 
    align-items: top;
    column-gap: 8px;
  }

  .empty-state {
    padding: 40px 20px;
    text-align: center;
    color: #666;
  }
</style>