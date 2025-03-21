<script>
  import { onMount } from 'svelte'
  import { doodleIcons, user } from '/src/lib/store'
  import Icon from '/src/lib/db/models/Icon.js'
  import { getRandomID } from '/src/lib/utils/core.js'
  import ColorPicker from './ColorPicker.svelte'
  let colors = ['black', 'orange', 'red', 'lightblue', 'blue', 'green']
  let name = ''
  let tags = ''
  let isShareable = false
  let drawing = false
  let color = 'black'
  let colorPickerColor = ''
  let prevX = 0
  let prevY = 0
  let canvas
  let ctx

  let showColorPicker = false;

  onMount(() => {
    canvas = document.getElementById('whiteboard')
    ctx = canvas.getContext('2d')
  })


  function toggleColorPicker() {
    showColorPicker = !showColorPicker;
  }

  function handleColorChange(colorUpdate) {
    color = colorUpdate;
    colorPickerColor = colorUpdate;
  }

  function handleSave () {    
    const dataURL = canvas.toDataURL()
    Icon.uploadDataURL({ 
      id: getRandomID(), 
      iconObject: {
        createdBy: $user.uid,
        name,
        dataURL,
        isShareable,
        tags
      }
    })
      .then((newIcon) => {
        $doodleIcons = [...$doodleIcons, newIcon]
        clearBoard()
      })
      .catch((err) =>
        console.error('error in BasicWhiteboard.svelte handleSave,', err)
      )
  }

  function handleStart(event) {
    event.preventDefault()
    drawing = true
    draw(event)
  }

  function handleEnd(event) {
    event.preventDefault()
    drawing = false
    prevX = 0
    prevY = 0 // Reset previous position
  }

  function handleMove(event) {
    event.preventDefault()
    if (!drawing) return
    draw(event)
  }

  function draw(event) {
    const rect = canvas.getBoundingClientRect()
    ctx.strokeStyle = color
    ctx.lineWidth = 6

    let x, y
    if (
      event.type === 'mousedown' ||
      event.type === 'mouseup' ||
      event.type === 'mousemove'
    ) {
      x = event.clientX - rect.left
      y = event.clientY - rect.top
    } else if (
      event.type === 'touchstart' ||
      event.type === 'touchend' ||
      event.type === 'touchmove'
    ) {
      x = event.touches[0].clientX - rect.left
      y = event.touches[0].clientY - rect.top
    }

    if (drawing) {
      ctx.beginPath()
      if (prevX && prevY) ctx.moveTo(prevX, prevY)
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    prevX = x
    prevY = y
  }

  function clearBoard() {
    const canvas = document.getElementById('whiteboard')
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    name = ''
    tags = ''
    isShareable = false
  }
</script>

<div style="display: flex; ">
  <div>
    <div
      style="display: flex; justify-content: space-around; margin-bottom: 8px; width: 240px;"
    >
      {#each colors as pencilColor}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class:selected={color === pencilColor}
          class="color-circle"
          on:click={() => (color = pencilColor)}
          style="background-color: {pencilColor}"
        ></div>
      {/each}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="color-circle custom-color"
        class:selected={!colors.includes(color)}
        on:click={toggleColorPicker}
        style="background-color: {colorPickerColor}"
        title="Custom color"
      >
        <span class="material-icons">
          colorize
        </span>
      </div>
    </div>


    <canvas
      id="whiteboard"
      width="240"
      height="240"
      on:mousedown={handleStart}
      on:mouseup={handleEnd}
      on:mousemove={handleMove}
      on:touchstart={handleStart}
      on:touchend={handleEnd}
      on:touchmove={handleMove}
    >
      Your browser does not support the HTML5 canvas tag.
    </canvas>
    <div>
      <button on:click={clearBoard}>Clear</button>
      <button class="save-button" disabled={!name} on:click={handleSave}
        >Save</button
      >
    </div>
  </div>
  <div class="input-container">
    <label for="name">Name:</label>
    <input id="name" type="text" bind:value={name} placeholder="funny-moves" />

    <label for="tags">Tags:</label>
    <input
      id="tags"
      type="text"
      bind:value={tags}
      placeholder="e.g. funny, moves, doodle"
    />

    <label for="public">Public:</label>
    <input id="public" type="checkbox" bind:checked={isShareable} />
  </div>
</div>
  <ColorPicker {showColorPicker} {handleColorChange} {toggleColorPicker} />

<style src="./BasicWhiteboard.css"></style>
