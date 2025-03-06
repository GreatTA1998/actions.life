<script>
  import { user } from '/src/store/userStore.js'
  import { updateFirestoreDoc } from '/src/helpers/firestoreHelpers.js'
  import { formatDate } from '/src/helpers/everythingElse.js'
  import { createEventDispatcher } from 'svelte'
  import { openDetailedCard } from '/src/store'

  export let routineInstances = null
  export let selectedRoutine = null

  const dispatch = createEventDispatcher()

  function togglePinToFavorite (routine) {
    updateFirestoreDoc(`/users/${$user.uid}/templates/${routine.id}`, {
      isStarred: !routine.isStarred
    })
  }
  
  function calculateGap(currentDate, nextDate) {
    if (!nextDate) return { type: 'normal', days: 0 }
    
    const daysDiff = Math.floor((new Date(currentDate) - new Date(nextDate)) / (1000 * 60 * 60 * 24))
    
    // Return both the type and the actual number of days
    if (daysDiff < 1) return { type: 'tight', days: daysDiff }
    if (daysDiff < 3) return { type: 'normal', days: daysDiff }
    if (daysDiff < 14) return { type: 'wide', days: daysDiff }
    if (daysDiff < 45) return { type: 'wider', days: daysDiff }
    return { type: 'widest', days: daysDiff }
  }

  function calculateGapSize(days) {
    // Base size for 1-day gap
    const baseSize = 16;
    // Use natural log with an offset to handle 0 and small values
    const logScale = Math.log(days + 1) * baseSize;
    // Cap the maximum gap size
    return Math.min(logScale, 160);
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

  // Add function to determine the dominant gap size
  function getDominantGapSize(instances) {
    if (!instances || instances.length < 2) return 'normal';
    
    const gapCounts = {};
    for (let i = 0; i < instances.length - 1; i++) {
      const gap = calculateGap(instances[i].startDateISO, instances[i + 1].startDateISO);
      gapCounts[gap.type] = (gapCounts[gap.type] || 0) + 1;
    }
    
    return Object.entries(gapCounts)
      .sort(([,a], [,b]) => b - a)[0][0]; // Returns the most frequent gap type
  }

  // Make this reactive
  $: dominantGapSize = getDominantGapSize(routineInstances);
  $: scaleFactor = {
    'tight': 0.5,    // For timelines with mostly same-day entries
    'normal': 1,     // Base scale
    'wide': 1.2,     // For timelines with mostly 2-week gaps
    'wider': 1.5,    // For timelines with mostly monthly gaps
    'widest': 2      // For timelines with mostly multi-month gaps
  }[dominantGapSize] || 1;
</script>

<h2 style="margin-top: 4px; display: flex; align-items: top;">
  {#if selectedRoutine.iconURL}
    <img src={selectedRoutine.iconURL} alt={selectedRoutine.name} />
  {:else}
    {selectedRoutine.name}
  {/if}

  <button class:shining={selectedRoutine.isStarred} on:click={() => togglePinToFavorite(selectedRoutine)} 
    style="margin-left: auto; margin-right: 16px; font-size: 36px;"
    class:material-symbols-outlined={!selectedRoutine.isStarred}
    class:material-icons={selectedRoutine.isStarred}
    >
    star
  </button>
</h2>

<div class="journal-entries">
  {#if routineInstances}
    {#each routineInstances as instance, i (instance.id)}
      {@const gap = calculateGap(instance.startDateISO, routineInstances[i + 1]?.startDateISO)}
      <div on:click={() => openDetailedCard(instance)} on:keydown
        class="entry-wrapper" 
        data-gap={gap.type}
        style="--gap-size: {calculateGapSize(gap.days)}px"
      >
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
              <img src={instance.imageDownloadURL} alt="Task" style="height: 300px; width: auto;" />
            {/if}

            {instance.notes || ''}
          </div>
        </div>
        
        {#if routineInstances[i + 1]}
          <div class="time-gap-container">
            <div class="time-gap-label">
              {formatTimeGap(instance.startDateISO, routineInstances[i + 1].startDateISO)}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<style>
  .shining {
    animation: shining 1s infinite;
    color: #ffd700;
  }

  .journal-entries {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
  }

  /* Timeline vertical line */
  .journal-entries::before {
    content: '';
    position: absolute;
    left: 80px;  /* Reduced from 120px */
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
  }

  .time-gap-container {
    position: relative;
    left: 80px;
    width: 2px;
    opacity: 0;
    transition: opacity 0.2s ease;
    height: var(--gap-size);
  }

  .time-gap-label {
    position: absolute;
    right: calc(100% + 8px);
    top: 50%;  /* Position at the middle of the gap */
    transform: translateY(-50%);  /* Center the label vertically */
    font-size: 0.85em;
    color: #666;
    white-space: nowrap;
    background: white;
    padding: 4px 8px;
    border-radius: 4px;
    text-align: right;
    line-height: 1;
  }

  .journal-entry {
    width: 100%;
    padding-left: 120px;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .journal-entry::before {
    content: '';
    position: absolute;
    left: 76px;
    top: 15px;  /* Adjusted to better align with text */
    width: 8px;
    height: 8px;
    background: white;
    border: 2px solid #666;
    border-radius: 50%;
    transform: translateY(-50%);  /* Add back transform for precise centering */
  }

  .journal-entry-header {
    margin-left: -120px;
    padding-left: 120px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    position: relative;
    min-height: 24px;
    padding-top: 4px;  /* Add slight padding to balance the header */
  }

  .date-time {
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 1.2;  /* Slightly increased for better text alignment */
  }

  .date {
    font-weight: 500;
  }

  .time {
    color: #666;
  }

  .duration {
    position: absolute;
    right: 0;  /* Align to the right edge */
    font-size: 0.9em;
    color: #666;
    border-radius: 4px;
  }

  .journal-entry-notes {
    color: rgb(55, 55, 55);
    line-height: 1.5;
    padding-right: 100px;  /* Make space for duration */
    display: flex; 
    align-items: top;
    column-gap: 8px;
  }

  /* Time-based gap sizes - more differentiated spacing */
  .entry-wrapper[data-gap="tight"] {
    --gap-size: 12px;
  }
  .entry-wrapper[data-gap="normal"] {
    --gap-size: 16px;
  }
  .entry-wrapper[data-gap="wide"] {
    --gap-size: 40px;  /* Increased from 32px */
  }
  .entry-wrapper[data-gap="wider"] {
    --gap-size: 96px;  /* Increased from 64px */
  }
  .entry-wrapper[data-gap="widest"] {
    --gap-size: 160px;  /* Increased from 96px */
  }

  /* More dramatic scaling ratios */
  .entry-wrapper[data-gap="wide"] .time-gap-container,
  .entry-wrapper[data-gap="wider"] .time-gap-container,
  .entry-wrapper[data-gap="widest"] .time-gap-container {
    opacity: 1;
  }
</style>