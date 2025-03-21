<script>
  import { formatDate } from '/src/lib/utils/core.js'
  import { user } from '/src/lib/store/userStore.js'
  import { onMount } from 'svelte'
  import { DateTime } from 'luxon'
  import MyJSDatePicker from '../../components/TaskPopup/MyJSDatePicker.svelte'
  import { collection, query, where, getDocs } from 'firebase/firestore'
  import { db } from '/src/lib/db/init.js'

  export let photoTasks = null
  let allPhotoTasks = []
  let dateRangePhotoTasks = []
  let startDateISO 
  let endDateISO
  
  // Date for navigation
  let centerDate = DateTime.now()
  let loadingPhotos = false
  
  // Add a state to track if we're showing random or monthly photos
  let showingRandom = false
  
  // Compute date interval for photo display - changing to a full month view
  $: {
    if (!showingRandom) {
      // For a full month view centered on selected date
      const startOfMonth = centerDate.startOf('month')
      const endOfMonth = centerDate.endOf('month')
      startDateISO = startOfMonth.toFormat('yyyy-MM-dd')
      endDateISO = endOfMonth.toFormat('yyyy-MM-dd')
    }
  }
  
  // Format for MyJSDatePicker (which uses MM/DD format and YYYY separately)
  $: {
    if (centerDate) {
      // Format as MM/DD
      const month = centerDate.month.toString().padStart(2, '0')
      const day = centerDate.day.toString().padStart(2, '0')
      mmdd = `${month}/${day}`
      yyyy = centerDate.year.toString()
    } else {
      mmdd = ''
      yyyy = ''
    }
  }
  let mmdd = '' 
  let yyyy = ''

  onMount(() => {
    fetchAllPhotoTasks()
  })

  // Fetch all tasks with photos once
  async function fetchAllPhotoTasks() {
    loadingPhotos = true
    try {
      const q = query(
        collection(db, "users", $user.uid, "tasks"),
        where("imageDownloadURL", "!=", "")
      )
      
      const snapshot = await getDocs(q)
      allPhotoTasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      
      // Sort by date (newest first)
      allPhotoTasks.sort((a, b) => new Date(b.startDateISO) - new Date(a.startDateISO))
      
      // Show initial photos
      updateDateRangePhotos()
    } catch (error) {
      console.error("Error fetching photos:", error)
    } finally {
      loadingPhotos = false
    }
  }

  // Update the dateRangePhotoTasks based on current mode
  function updateDateRangePhotos() {
    if (showingRandom) {
      // Get 10 random photos from all photos
      const randomized = [...allPhotoTasks]
      dateRangePhotoTasks = randomized.sort(() => Math.random() - 0.5).slice(0, 10)
    } else {
      // Filter photos for the current month
      dateRangePhotoTasks = allPhotoTasks.filter(task => 
        task.startDateISO >= startDateISO && 
        task.startDateISO <= endDateISO
      )
    }
  }

  function handleDateSelected(event) {
    const { selectedDate, selectedYear } = event.detail
    console.log("Date selected:", selectedDate, selectedYear)
    
    if (selectedDate && selectedYear) {
      // Convert MM/DD format to DateTime object
      const [month, day] = selectedDate.split('/')
      const newCenterDate = DateTime.fromObject({
        year: parseInt(selectedYear),
        month: parseInt(month),
        day: parseInt(day)
      })
      
      showingRandom = false
      centerDate = newCenterDate
      updateDateRangePhotos()
    }
  }
</script>

<div class="section">
  
  <div class="navigation-controls">
    <div class="date-navigation">
      <div class="navigation-row">
        <div class="date-picker-container" on:click={() => {
          const datePicker = document.querySelector('.date-picker-container input')
          if (datePicker) datePicker.focus()
        }}>
          <span class="calendar-icon material-symbols-outlined">calendar_month</span>
          <MyJSDatePicker
            MMDD={mmdd}
            YYYY={yyyy}
            placeholder="Pick a date"
            on:date-selected={handleDateSelected}
          />
          <span class="year-display">{yyyy}</span>
        </div>
        <div class="date-range-info">
          Showing photos from {formatDate(startDateISO)} to {formatDate(endDateISO)}
        </div>
      </div>
    </div>
  </div>
  
  <div class="month-selector">
    <div class="month-actions">
      <button 
        class="action-button random-button" 
        class:active={showingRandom}
        on:click={() => {
          showingRandom = true
          updateDateRangePhotos()
        }}
      >
        <span class="material-symbols-outlined">shuffle</span>
        Random
      </button>
    </div>

    {#each Array.from({ length: 3 }) as _, yearIndex}
      {@const year = DateTime.now().minus({ years: yearIndex })}
      <div class="year-group">
        <div class="year-label">{year.year}</div>
        <div class="months-container">
          {#each Array.from({ length: 12 }) as _, monthIndex}
            {@const monthDate = DateTime.fromObject({ year: year.year, month: 12 - monthIndex })}
            {@const isCurrentMonth = monthDate <= DateTime.now()}
            {#if isCurrentMonth}
              <button 
                class="month-button" 
                class:active={!showingRandom && centerDate.hasSame(monthDate, 'month') && centerDate.hasSame(monthDate, 'year')}
                on:click={() => {
                  showingRandom = false
                  centerDate = monthDate
                  updateDateRangePhotos()
                }}
              >
                {monthDate.toFormat('MMM')}
              </button>
            {/if}
          {/each}
        </div>
      </div>
    {/each}
  </div>
  
  <div class="photo-grid">
    {#if loadingPhotos}
      <div class="loading">Loading photos...</div>
    {:else if dateRangePhotoTasks && dateRangePhotoTasks.length > 0}
      {#each dateRangePhotoTasks as task (task.id)}
        <div class="photo-grid-item">
          <img 
            src={task.imageDownloadURL} 
            alt="Task" 
            loading="lazy"
          />
          <div class="photo-overlay">
            <div class="photo-date">
              {formatDate(task.startDateISO)}
            </div>
            {#if task.notes}
              <div class="photo-caption">
                {task.notes}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    {:else}
      <div class="no-photos">No photos found for this {showingRandom ? 'selection' : 'date range'}</div>
    {/if}
  </div>
</div>

<style>
  .section {
    margin-bottom: 20px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .instruction-text {
    font-size: 11px;
    color: #666;
    font-style: italic;
  }

  .navigation-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .date-navigation {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .navigation-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .current-month-display {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .date-picker-container {
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    padding: 3px 6px;
    border-radius: 4px;
    min-width: 140px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .date-picker-container:hover {
    background-color: #e0e0e0;
  }

  .calendar-icon {
    font-size: 16px;
    margin-right: 4px;
    color: #666;
  }

  .year-display {
    margin-left: 4px;
    color: #666;
    font-weight: 500;
  }

  .date-picker-container :global(input) {
    background-color: transparent;
    border: none;
    padding: 4px;
    font-weight: 500;
    cursor: pointer;
  }

  .date-range-info {
    font-size: 12px;
    color: #666;
  }

  .month-selector {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
  }

  .month-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
    font-size: 13px;
    font-weight: 500;
  }

  .action-button span {
    font-size: 16px;
    color: #666;
  }

  .random-button {
    background-color: #f0f0f0;
  }

  .random-button:hover {
    background-color: #e0e0e0;
  }

  .random-button.active {
    background-color: #007bff;
    color: white;
  }

  .random-button.active span {
    color: white;
  }

  .year-group {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
  }

  .year-label {
    font-weight: 600;
    font-size: 13px;
    color: #333;
    min-width: 50px;
  }

  .months-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }

  .month-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    transition: background-color 0.2s;
    font-size: 12px;
    white-space: nowrap;
    min-width: 40px;
    height: 24px;
  }

  .month-button:hover {
    background-color: #f0f0f0;
  }

  .month-button.active {
    background-color: #007bff;
    color: white;
  }

  .photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 8px;
    min-height: 180px;
  }

  .loading, .no-photos {
    grid-column: 1 / -1;
    text-align: center;
    padding: 20px;
    color: #666;
    font-style: italic;
  }

  .photo-grid-item {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 8px;
    background: #f0f0f0;
  }

  .photo-grid-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .photo-grid-item:hover img {
    transform: scale(1.05);
  }

  .photo-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    color: white;
    opacity: 1;
  }

  .photo-date {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .photo-caption {
    font-size: 0.9em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  /* Remove refresh button styles */
  .refresh-button, .refresh-button:hover {
    display: none;
  }
</style>