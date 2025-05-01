<script>
  import { createEventDispatcher } from 'svelte'
  
  export let value = ''
  export let placeholder = 'Time'
  export let pattern = '[0-9]{2}:[0-9]{2}'
  
  const dispatch = createEventDispatcher()
  
  let isMenuDisplayed = false
  
  const hours = []
  for (let i = 0; i < 24; i++) {
    hours.push(i < 10 ? `0${i}` : `${i}`)
  }
  const minutes = ['00', '15', '30', '45']
  
  function selectTime(hour, minute) {
    const timeString = `${hour}:${minute}`
    value = timeString
    dispatch('change', { value: timeString })
    isMenuDisplayed = false
  }
  
  function handleClickOutside(event) {
    if (!event.target.closest('.time-picker')) {
      isMenuDisplayed = false
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="time-picker">
  <input
    {value}
    {placeholder}
    {pattern}
    on:input={(e) => dispatch('input', e.target.value)}
    on:click|stopPropagation={() => (isMenuDisplayed = !isMenuDisplayed)}
    class="time-dropdown"
    readonly
  />
  
  {#if isMenuDisplayed}
    <div class="time-picker-container">
      <div class="time-grid">
        <div class="header-cell"></div>
        {#each minutes as minute}
          <div class="header-cell">{minute}</div>
        {/each}
        
        {#each hours as hour}
          <div class="hour-cell">{hour}</div>
          {#each minutes as minute}
            <button
              on:click|stopPropagation={() => selectTime(hour, minute)}
              class="time-cell"
              class:selected={value === `${hour}:${minute}`}
              class:current-hour={Number(hour) === new Date().getHours()}
            >
              {hour}:{minute}
            </button>
          {/each}
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .time-picker {
    position: relative;
    width: fit-content;
  }
  
  .time-dropdown {
    width: 75px;
    text-align: center;
    height: 36px;
    border-radius: 6px;
    border: 1px solid #eaeaea;
    font-size: 14px;
    color: #333;
    background: white;
    cursor: pointer;
    padding: 0 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    transition: all 0.2s ease;
  }
  
  .time-dropdown:hover {
    border-color: #c0c0c0;
  }
  
  .time-dropdown:focus {
    border-color: #6b6b6b;
    outline: none;
    box-shadow: 0 0 0 1px rgba(107, 107, 107, 0.2);
  }
  
  .time-picker-container {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
  }
  
  .time-grid {
    display: grid;
    grid-template-columns: 40px repeat(4, 65px);
    border: 1px solid #eaeaea;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .header-cell {
    font-size: 13px;
    font-weight: 500;
    color: #6b6b6b;
    padding: 8px 4px;
    text-align: center;
    background: #f8f8f8;
    border-bottom: 1px solid #eaeaea;
  }
  
  .hour-cell {
    font-size: 13px;
    font-weight: 500;
    color: #555;
    padding: 8px 4px;
    text-align: center;
    background: #f8f8f8;
    border-right: 1px solid #eaeaea;
  }
  
  .time-cell {
    padding: 8px 4px;
    font-size: 13px;
    text-align: center;
    background: white;
    border: none;
    border-bottom: 1px solid #eaeaea;
    color: #555;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .time-cell:hover {
    background: #f5f5f5;
  }
  
  .time-cell.selected {
    background: #6b6b6b;
    color: white;
  }
  
  .time-cell.current-hour {
    background: #f0f7ff;
  }
  
  .time-picker-container::-webkit-scrollbar {
    width: 8px;
  }
  
  .time-picker-container::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  .time-picker-container::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
  }
  
  .time-picker-container::-webkit-scrollbar-thumb:hover {
    background: #ccc;
  }
</style>