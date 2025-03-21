<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let value = '';
  export let placeholder = 'Time';
  export let pattern = '[0-9]{2}:[0-9]{2}';

  let isMenuDisplayed = false;

  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(i < 10 ? `0${i}` : `${i}`);
  }
  const minutes = ['00', '15', '30', '45'];

  function selectTime(hour, minute) {
    const timeString = `${hour}:${minute}`;
    value = timeString;
    dispatch('change', { value: timeString });
    isMenuDisplayed = false;
  }

  function handleClickOutside(event) {
    if (!event.target.closest('.time-picker')) {
      isMenuDisplayed = false;
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
          <div class="header-cell">
           
          </div>
        {/each}

        {#each hours as hour}
          <button class="hour-cell" on:click|stopPropagation={() => selectTime(hour, '00')}>
            {hour}
          </button>
          {#each minutes as minute}
            <button
              on:click|stopPropagation={() => selectTime(hour, minute)}
              class="time-cell"
              class:selected={value === `${hour}:${minute}`}
              class:current-hour={Number(hour) === new Date().getHours()}
              class:merge-with-hour={minute === '00'}
              style="border-right: 1px solid #eee;"
            >
              <div class="clickable-indicator">:{minute}</div>
            </button>
          {/each}
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .merge-with-hour {
    background-color: #f8f8f8;
  }

  .time-picker {
    position: relative;
    width: fit-content;
  }

  .time-dropdown {
    width: 80px;
    text-align: center;
    height: 32px;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    background: white;
  }

  .time-picker-container {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
  }

  .time-grid {
    display: grid;
    grid-template-columns: 50px repeat(4, 40px);
    /* gap: 1px;
    background: #f5f5f5; */
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
  }

  .time-grid > div {
    background: white;
    padding: 6px 4px;
    text-align: center;
    font-size: 14px;
  }

  .header-cell {
    font-size: 13px;
    font-weight: 400;
    color: #666;
    position: sticky;
    top: 0;
    background: #f8f8f8;
    z-index: 2;
    border-bottom: 1px solid #eee;
  }

  .hour-cell {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    position: sticky;
    left: 0;
    /* background: #f8f8f8; */
    z-index: 1;
    /* border-right: 1px solid #eee; */
  }

  .time-cell {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    font-weight: 300;
    color: rgb(150, 150, 150);
  }

  .clickable-indicator {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s ease;
  }

  .time-cell:hover .clickable-indicator {
    background-color: #f0f0f0;
  }

  .selected .clickable-indicator {
    background-color: #2563eb;
    color: white;
  }

  .selected:hover .clickable-indicator {
    background-color: #1d4ed8;
  }

  .current-hour .clickable-indicator {
    background-color: #f0f7ff;
  }

  /* Scrollbar styling */
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