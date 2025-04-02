<script>
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    export let handleColorChange = () => {};
    export let toggleColorPicker = () => {};
    export let currentColor = '#000000';
    export let showColorPicker = false;
  
    let hue = 0;
    let saturation = 100;
    let lightness = 50;
  
    $: {
      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      if (color !== currentColor) {
        currentColor = color;
      }
    }
  
    function saveColor() {
      handleColorChange(currentColor);
      toggleColorPicker();
    }
  </script>
  {#if showColorPicker}

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="overlay" on:click|self={close} transition:fade={{ duration: 200 }}>
      <div class="color-picker">
        <div class="color-display" style="background-color: {currentColor}"></div>
        <div class="sliders">
          <input type="range" min="0" max="360" bind:value={hue}>
          <input type="range" min="0" max="100" bind:value={saturation}>
          <input type="range" min="0" max="100" bind:value={lightness}>
        </div>
        <button on:click={saveColor}>Done</button>
      </div>
    </div>
  {/if}
  <style>
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
  
    .color-picker {
      background-color: #f5f5f7;
      border-radius: 14px;
      padding: 20px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
      width: 300px;
    }
  
    .color-display {
      height: 100px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
  
    .sliders {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  
    input[type="range"] {
      width: 100%;
      -webkit-appearance: none;
      height: 6px;
      border-radius: 3px;
      background: #d1d1d6;
      outline: none;
    }
  
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #ffffff;
      cursor: pointer;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
    }
  
    button {
      margin-top: 20px;
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 7px;
      background-color: #007aff;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
  
    button:hover {
      background-color: #0056b3;
    }
  </style>