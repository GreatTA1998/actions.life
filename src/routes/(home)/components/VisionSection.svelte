<script>
  import { fade } from 'svelte/transition'

  // Demo data for the archive
  const demoRoutine = {
    name: "Morning Run",
    iconURL: "🏃",
    isStarred: true
  }

  const demoInstances = [
    {
      id: '2',
      startDateISO: '2024-03-14',
      startTime: '07:45',
      duration: 40,
      notes: 'Slightly shorter run today. Legs felt a bit heavy but pushed through.'
    },
    {
      id: '3',
      startDateISO: '2024-03-12',
      startTime: '08:00',
      duration: 50,
      notes: 'Longer run today. Great weather, perfect for building endurance.'
    },
    {
      id: '4',
      startDateISO: '2024-03-10',
      startTime: '07:30',
      duration: 45,
      notes: 'Morning run with a friend. Good conversation and motivation.'
    }
  ]

  function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function formatTime(timeStr) {
    if (!timeStr) return 'N/A'
    const [hours, minutes] = timeStr.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
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

  function calculateGap(currentDate, nextDate) {
    if (!nextDate) return { type: 'normal', days: 0 }
    const daysDiff = Math.floor((new Date(currentDate) - new Date(nextDate)) / (1000 * 60 * 60 * 24))
    if (daysDiff < 1) return { type: 'tight', days: daysDiff }
    if (daysDiff < 3) return { type: 'normal', days: daysDiff }
    if (daysDiff < 14) return { type: 'wide', days: daysDiff }
    if (daysDiff < 45) return { type: 'wider', days: daysDiff }
    return { type: 'widest', days: daysDiff }
  }

  function formatTimeGap(currentDate, nextDate) {
    const daysDiff = Math.floor((new Date(currentDate) - new Date(nextDate)) / (1000 * 60 * 60 * 24))
    if (daysDiff < 7) return `${daysDiff} days`
    if (daysDiff < 30) return `${Math.floor(daysDiff/7)} weeks`
    if (daysDiff < 365) return `${Math.floor(daysDiff/30)} months`
    return `${Math.floor(daysDiff/365)} years`
  }
</script>

<div class="vision-section" in:fade={{ duration: 400 }}>
  <div class="vision-content">
    <!-- <div class="demo-header">
      <h2>Summary</h2>
      <p class="demo-hint">Get a wholistic log of what you've done to drive behavior change</p>
    </div> -->


    <!-- Show a quick GIF of how the components interface with each other. 5 seconds perhaps -->

    <!-- <div class="vision-main">
      <div class="vision-narrative">
        (Show a quick GIF of how the components interface with each other. 5 seconds perhaps. Clearly explain how it all fits together, and 
        the overall vision for the app (in simple terms). 
        
        Don't introduce any more features, use the past updates hierarchy for the user
        to explore new features they're interested in learning about in relation to the history of the app.)
        <br><br>
        
        Initially, actions.life helps you organize complex plans. Over time, it becomes a structured log of your life.
        <br><br>
        The archive is designed for retrieval and reflection. Search for "hiking training," and you'll find every relevant entry—timed, contextualized, and connected.
        <br><br>
        Unlike siloed apps that track sleep in isolation, actions.life captures the surrounding context: meals, workouts, routines. 
      </div>
    </div> -->
  </div>
</div>

<style lang="scss">
  .vision-section {
    padding: 120px 0;
    background: linear-gradient(180deg, rgba(250, 250, 250, 0) 0%, rgba(250, 250, 250, 1) 100%);
  }

  .vision-content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .demo-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .demo-header h2 {
    margin-bottom: 8px;
    font-size: 28px;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.01em;
  }

  .demo-hint {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }

  .vision-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    margin-bottom: 80px;
    align-items: start;
  }

  .vision-narrative {
    max-width: none;
    margin: 0;
    text-align: left;
    padding-top: 24px;

    p {
      font-size: 1.125rem;
      line-height: 1.7;
      color: #4B5563;
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .archive-demo {
    margin: 0;
    padding: 32px;
    background: var(--offwhite-bg);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    height: fit-content;

    h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 32px;
    }
  }

  .journal-entries {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
  }

  .journal-entries::before {
    content: '';
    position: absolute;
    left: 80px;
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
    top: 50%;
    transform: translateY(-50%);
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
    margin-bottom: 24px;
  }

  .journal-entry::before {
    content: '';
    position: absolute;
    left: 76px;
    top: 15px;
    width: 8px;
    height: 8px;
    background: white;
    border: 2px solid #666;
    border-radius: 50%;
    transform: translateY(-50%);
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
    line-height: 1.5;
    padding-right: 100px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin-bottom: 8px;
    }
  }

  .entry-wrapper[data-gap="tight"] { --gap-size: 12px; }
  .entry-wrapper[data-gap="normal"] { --gap-size: 16px; }
  .entry-wrapper[data-gap="wide"] { --gap-size: 40px; }
  .entry-wrapper[data-gap="wider"] { --gap-size: 96px; }
  .entry-wrapper[data-gap="widest"] { --gap-size: 160px; }

  .entry-wrapper[data-gap="wide"] .time-gap-container,
  .entry-wrapper[data-gap="wider"] .time-gap-container,
  .entry-wrapper[data-gap="widest"] .time-gap-container {
    opacity: 1;
  }

  .vision-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }

  .vision-card {
    background: var(--offwhite-bg);
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  }

  .card-content {
    padding: 32px;
  }

  .icon {
    font-size: 2rem;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 12px;
  }

  p {
    font-size: 1rem;
    line-height: 1.6;
    color: #4B5563;
    margin: 0;
  }

  @media (max-width: 1024px) {
    .vision-main {
      grid-template-columns: 1fr;
      gap: 48px;
    }

    .vision-narrative {
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }

    .archive-demo {
      max-width: 800px;
      margin: 0 auto;
    }
  }

  @media (max-width: 768px) {
    .vision-section {
      padding: 80px 0;
    }

    .vision-title {
      font-size: 2rem;
    }

    .vision-narrative {
      p {
        font-size: 1rem;
      }
    }

    .archive-demo {
      padding: 24px;
    }

    .vision-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 