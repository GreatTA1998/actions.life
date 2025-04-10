<script>
  import { createEventDispatcher } from 'svelte'
  import MyTimePicker from './MyTimePicker.svelte'
  import Task from '/src/lib/db/models/Task.js'
  import { createDebouncedFunction } from '/src/lib/utils/core.js'

  export let taskObject

  const dispatch = createEventDispatcher()
  let isPopupOpen = false
  let repeatType = taskObject.repeatType || ''
  let repeatTime = taskObject.repeatTime || taskObject.startTime || ''

  const debouncedUpdate = createDebouncedFunction(
    (id, keyValueChanges) => Task.update({ id, keyValueChanges }), 
    1000
  )

  function togglePopup() {
    isPopupOpen = !isPopupOpen
  }

  function setRepeatType(type) {
    repeatType = type
    debouncedUpdate(taskObject.id, { 
      repeatType: type,
      repeatTime: repeatTime
    })
  }

  function setRepeatTime(time) {
    repeatTime = time
    debouncedUpdate(taskObject.id, { 
      repeatType,
      repeatTime: time
    })
  }

  function closePopup() {
    isPopupOpen = false
  }
</script>

<button on:click|stopPropagation={togglePopup} class="action-button material-symbols-outlined">
  autorenew
  <span class="tooltip">Repeat this task</span>
</button>

{#if isPopupOpen}
<div style="position: relative;">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="popup-overlay" on:click|self={closePopup}>
      <div class="repeat-popup">
        <div class="popup-header">
          <h3>Repeat Task</h3>
        </div>
        
        <div class="repeat-options">
          <div class="option-group">
            <div class="option-label">Repeat</div>
            <div class="option-buttons">
              <button 
                class="option-button" 
                class:selected={repeatType === 'weekly'}
                on:click={() => setRepeatType('weekly')}
              >
                Weekly
              </button>
              <button 
                class="option-button"
                class:selected={repeatType === 'monthly'}
                on:click={() => setRepeatType('monthly')}
              >
                Monthly
              </button>
              <button 
                class="option-button"
                class:selected={repeatType === 'yearly'}
                on:click={() => setRepeatType('yearly')}
              >
                Yearly
              </button>
            </div>
          </div>

          {#if repeatType}
            <div class="option-group">
              <div class="option-label">Time</div>
              <MyTimePicker
                value={repeatTime}
                placeholder="9:00"
                pattern="[0-9]{1,2}:[0-9]{2}"
                on:time-selected={e => setRepeatTime(e.detail.selectedHHMM)}
              />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .action-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 23px;
    color: rgb(20, 20, 20);
    position: relative;
  }

  .tooltip {
    visibility: hidden;
    background-color: #555;
    color: white;
    text-align: center;
    padding: 5px;
    border-radius: 6px;
    position: absolute;
    z-index: 5;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%) translateY(-5px);
    white-space: nowrap;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
  }

  .action-button:hover .tooltip {
    visibility: visible;
  }

  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .repeat-popup {
    background-color: white;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .popup-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .repeat-options {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .option-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .option-label {
    font-size: 14px;
    color: #666;
  }

  .option-buttons {
    display: flex;
    gap: 8px;
  }

  .option-button {
    padding: 6px 12px;
    border-radius: 16px;
    border: 1px solid #ddd;
    background: white;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .option-button:hover {
    background: #f5f5f5;
  }

  .option-button.selected {
    background: var(--logo-twig-color);
    color: white;
    border-color: var(--logo-twig-color);
  }
</style> 