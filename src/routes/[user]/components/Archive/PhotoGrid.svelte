<script>
  import MultiPhotoUploader from '$lib/components/MultiPhotoUploader.svelte'
  import MonthYearNavigator from '$lib/components/MonthYearNavigator.svelte'
  import { user, updateCache, openTaskPopup } from '$lib/store/index.js'
  import { onMount, onDestroy} from 'svelte'
  import { DateTime } from 'luxon'
  import { collection, query, where, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'

  let unsub
  let allPhotoTasks = $state([])
  let dateRangePhotoTasks = $state([])
  
  // Date for navigation - bind to MonthYearNavigator
  let centerDate = $state(DateTime.now().startOf('month'))
  let loadingPhotos = $state(false)
  
  // Use a string for view mode instead of boolean
  let viewMode = $state('month') // 'month' or 'random'
  
  // Add state for button animation
  let isSpinning = $state(false)

  // Initialize date range from centerDate - use derived to react to changes
  let startDateISO = $derived(centerDate.startOf('month').toISODate())
  let endDateISO = $derived(centerDate.endOf('month').toISODate())

  onMount(() => {
    listenToPhotoTasks()
  })

  onDestroy(() => {
    if (unsub) unsub()
  })

  async function listenToPhotoTasks() {
    loadingPhotos = true
    try {
      const q = query(
        collection(db, "users", $user.uid, "tasks"),
        where("imageDownloadURL", "!=", "")
      )
      
      unsub = onSnapshot(q, snapshot => {
        const tasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        updateCache(tasks)
        allPhotoTasks = tasks
        allPhotoTasks.sort((a, b) => new Date(b.startDateISO) - new Date(a.startDateISO))
        updatePhotoDisplay()
      })
    } catch (error) {
      console.error("Error fetching photos:", error)
    } finally {
      loadingPhotos = false
    }
  }

  // Update the photo display based on current view mode
  function updatePhotoDisplay() {
    if (viewMode === 'random') {
      // Get 10 random photos from all photos
      const randomized = [...allPhotoTasks]
      dateRangePhotoTasks = randomized.sort(() => Math.random() - 0.5).slice(0, 10)
    } else {
      // Filter photos for the current month - use consistent DateTime methods
      // Only filter if we have valid date range
      if (!startDateISO || !endDateISO) {
        dateRangePhotoTasks = []
        return
      }
      
      dateRangePhotoTasks = allPhotoTasks.filter(task => {
        if (!task.startDateISO) return false
        
        // Use same parsing method for consistency
        const taskDate = DateTime.fromISO(task.startDateISO)
        const startDate = DateTime.fromISO(startDateISO)
        const endDate = DateTime.fromISO(endDateISO)
        
        // Compare dates at start of day for accurate range checking
        const taskDateStart = taskDate.startOf('day')
        const startDateStart = startDate.startOf('day')
        const endDateStart = endDate.startOf('day')
        
        return taskDateStart >= startDateStart && taskDateStart <= endDateStart
      })
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
  
  // Update display when date range, view mode, or allPhotoTasks changes
  $effect(() => {
    updatePhotoDisplay()
  })
</script>

<div>
  <MultiPhotoUploader style="position: absolute; right: 1vw; top: 1vw;"/>

  <div class="navigation-container">
    <MonthYearNavigator bind:month={centerDate} />
    <button 
      class="action-button random-button" 
      class:active={viewMode === 'random'}
      class:spinning={isSpinning}
      onclick={showRandomPhotos}
      title="Show random photos"
    >
      <span class="material-symbols-outlined">casino</span>
    </button>
  </div>
  
  <div class="photo-grid">
    {#if loadingPhotos}
      <div class="loading">Loading photos...</div>
    {:else if dateRangePhotoTasks && dateRangePhotoTasks.length > 0}
      {#each dateRangePhotoTasks as task (task.id)}
        <div 
          class="photo-grid-item" 
          onclick={() => openTaskPopup(task)}
          onkeydown={(e) => e.key === 'Enter' && openTaskPopup(task)}
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
            <div style="display: flex;">
              <div class="photo-date truncate-to-one-line" style="font-size: 1rem; font-weight: 500;">
                {task.name}
              </div>

              <div style="margin-left: auto; white-space: nowrap; font-weight: 300; font-size: 1rem;">
                {DateTime.fromISO(task.startDateISO).toFormat('MMM d, yyyy')}
              </div>
            </div>
    
            <!-- <div class="photo-caption">
              {task.notes}
            </div> -->
          </div>
        </div>
      {/each}
    {:else}
      <div class="no-photos">No photos found for this {viewMode === 'random' ? 'selection' : 'date range'}</div>
    {/if}
  </div>
</div>

<style>
  .navigation-container {
    display: flex;
    align-items: center;
    gap: 12px;
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

  .photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 2px;
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
    background: #f0f0f0;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .photo-grid-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

  .photo-caption {
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>