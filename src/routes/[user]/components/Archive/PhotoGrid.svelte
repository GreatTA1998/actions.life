<script>
  import { formatDate } from '/src/lib/utils/core.js'
  import { user, tasksCache, openTaskPopup } from '/src/lib/store/index.js'
  import { onMount } from 'svelte'
  import { DateTime } from 'luxon'
  import { collection, query, where, getDocs } from 'firebase/firestore'
  import { db } from '/src/lib/db/init.js'

  let allPhotoTasks = []
  let dateRangePhotoTasks = []
  let startDateISO 
  let endDateISO
  
  // Date for navigation
  let centerDate = DateTime.now()
  let loadingPhotos = false
  
  // Use a string for view mode instead of boolean
  let viewMode = 'month' // 'month' or 'random'
  
  // Add state for button animation
  let isSpinning = false
  
  // Compute date interval for photo display - changing to a full month view
  $: {
    if (viewMode === 'month') {
      // For a full month view centered on selected date
      const startOfMonth = centerDate.startOf('month')
      const endOfMonth = centerDate.endOf('month')
      startDateISO = startOfMonth.toISODate()
      endDateISO = endOfMonth.toISODate()
      
      console.log("Date range set:", 
        startOfMonth.toFormat("MMMM yyyy"), 
        "to", 
        endOfMonth.toFormat("MMMM yyyy"),
        "ISO:", startDateISO, "to", endDateISO
      )
      
      // Explicitly trigger update when date range changes
      updatePhotoDisplay()
    }
  }

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
      const tasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      
      // Add tasks to tasksCache
      tasksCache.update(cache => {
        for (const task of tasks) {
          cache[task.id] = task
        }
        return cache
      })
      
      allPhotoTasks = tasks
      
      // Sort by date (newest first)
      allPhotoTasks.sort((a, b) => new Date(b.startDateISO) - new Date(a.startDateISO))
      
      // Show initial photos
      updatePhotoDisplay()
    } catch (error) {
      console.error("Error fetching photos:", error)
    } finally {
      loadingPhotos = false
    }
  }

  // Update the photo display based on current view mode
  function updatePhotoDisplay() {
    console.log("Updating photo display, viewMode =", viewMode, "startDateISO =", startDateISO, "endDateISO =", endDateISO)
    
    if (viewMode === 'random') {
      // Get 10 random photos from all photos
      const randomized = [...allPhotoTasks]
      dateRangePhotoTasks = randomized.sort(() => Math.random() - 0.5).slice(0, 10)
      console.log("Random mode, showing", dateRangePhotoTasks.length, "photos")
    } else {
      // Filter photos for the current month - use consistent DateTime methods
      dateRangePhotoTasks = allPhotoTasks.filter(task => {
        if (!task.startDateISO) return false
        
        // Use same parsing method for consistency
        const taskDate = DateTime.fromISO(task.startDateISO)
        const startDate = DateTime.fromISO(startDateISO)
        const endDate = DateTime.fromISO(endDateISO)
        
        const isInRange = taskDate >= startDate && taskDate <= endDate
        
        // Log a sample of the comparisons
        if (task.id.includes("1")) {
          console.log("Photo date check:", 
            task.startDateISO, 
            "as", taskDate.toFormat("MMMM yyyy"),
            "in range", startDate.toFormat("MMMM yyyy"), 
            "to", endDate.toFormat("MMMM yyyy"),
            "=", isInRange
          )
        }
        
        return isInRange
      })
      
      console.log("Month mode, showing", dateRangePhotoTasks.length, "photos for date range", startDateISO, "to", endDateISO)
    }
  }
  
  // Set to random mode with animation
  function showRandomPhotos() {
    // Trigger animation
    isSpinning = true;
    setTimeout(() => {
      isSpinning = false;
    }, 500);
    
    viewMode = 'random'
    updatePhotoDisplay()
  }
  
  // Set to month mode
  function selectMonth(newCenterDate) {
    console.log('Selecting month, old centerDate =', centerDate.toFormat("MMMM yyyy"), 'new centerDate =', newCenterDate.toFormat("MMMM yyyy"))
    viewMode = 'month'
    centerDate = newCenterDate
    
    // Immediately calculate new date range and update display
    const startOfMonth = centerDate.startOf('month')
    const endOfMonth = centerDate.endOf('month')
    startDateISO = startOfMonth.toISODate()
    endDateISO = endOfMonth.toISODate()
    
    console.log('New date range set in selectMonth:', startDateISO, 'to', endDateISO)
    updatePhotoDisplay()
  }
</script>

<div class="section">
  <div class="month-selector">
    {#each Array.from({ length: 3 }) as _, yearIndex}
      {@const year = DateTime.now().minus({ years: yearIndex })}
      <div class="year-group">
        <div class="year-label">{year.year}</div>
        <div class="months-container">
          {#each Array.from({ length: 12 }) as _, monthIndex}
            {@const monthDate = DateTime.fromObject({ year: year.year, month: monthIndex + 1 })}
            {@const isCurrentMonth = monthDate <= DateTime.now()}
            {#if isCurrentMonth}
              <button 
                class="month-button" 
                class:active={viewMode === 'month' && centerDate.hasSame(monthDate, 'month') && centerDate.hasSame(monthDate, 'year')}
                on:click={() => selectMonth(monthDate)}
              >
                {monthDate.toFormat('MMM')}
              </button>
            {/if}
          {/each}
          
          {#if yearIndex === 0}
            <button 
              class="action-button random-button" 
              class:active={viewMode === 'random'}
              class:spinning={isSpinning}
              on:click={showRandomPhotos}
              title="Show random photos"
            >
              <span class="material-symbols-outlined">casino</span>
            </button>
          {/if}
        </div>
      </div>
    {/each}
  </div>
  
  <div class="photo-grid">
    {#if loadingPhotos}
      <div class="loading">Loading photos...</div>
    {:else if dateRangePhotoTasks && dateRangePhotoTasks.length > 0}
      {#each dateRangePhotoTasks as task (task.id)}
        <div 
          class="photo-grid-item" 
          on:click={() => openTaskPopup(task)}
          on:keydown={(e) => e.key === 'Enter' && openTaskPopup(task)}
          tabindex="0"
          role="button"
          aria-label="Open task details"
        >
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
      <div class="no-photos">No photos found for this {viewMode === 'random' ? 'selection' : 'date range'}</div>
    {/if}
  </div>
</div>

<style>
  .section {
    margin-bottom: 20px;
  }

  .month-selector {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
  }

  .year-group {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
  }

  .year-label {
    font-weight: 600;
    font-size: 15px;
    color: #333;
    min-width: 60px;
  }

  .months-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    font-size: 15px;
    font-weight: 500;
  }

  .random-button {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background-color: #f8f8f8;
    color: #888;
    opacity: 0.7;
    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
    transform-origin: center;
    margin-left: 10px;
  }

  .random-button:hover {
    opacity: 1;
    background-color: #f0f0f0;
    transform: rotate(15deg) scale(1.05);
    box-shadow: 0 2px 4px rgba(0,0,0,0.12);
    color: #555;
  }
  
  .random-button.spinning {
    animation: spin-bounce 0.5s ease-out;
  }
  
  @keyframes spin-bounce {
    0% {
      transform: rotate(0deg) scale(1);
    }
    50% {
      transform: rotate(180deg) scale(1.15);
    }
    100% {
      transform: rotate(360deg) scale(1);
    }
  }

  .random-button.active {
    background-color: #e9f3ff;
    color: #007bff;
    opacity: 1;
    transform: rotate(0deg) scale(1);
    box-shadow: 0 2px 4px rgba(0,123,255,0.2);
  }

  .random-button span {
    font-size: 22px;
  }

  .month-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
    font-size: 14px;
    white-space: nowrap;
    min-width: 50px;
    height: 32px;
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
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
    min-height: 240px;
  }

  .loading, .no-photos {
    grid-column: 1 / -1;
    text-align: center;
    padding: 30px;
    color: #666;
    font-style: italic;
    font-size: 16px;
  }

  .photo-grid-item {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 8px;
    background: #f0f0f0;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .photo-grid-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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
    display: flex;
    flex-direction: column;
  }

  .photo-date {
    font-weight: 500;
    margin-bottom: 6px;
    font-size: 1rem;
  }

  .photo-caption {
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>