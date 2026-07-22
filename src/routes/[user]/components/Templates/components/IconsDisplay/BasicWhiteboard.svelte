<script>
  import { user } from '$lib/store'
  import { randomID } from '$lib/utils/core.js'
  import CheckboxSquare from '$lib/components/CheckboxSquare.svelte'
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import IconDetailLayout from './IconDetailLayout.svelte'
  import MslCasino from 'virtual:icons/material-symbols-light/casino'
  import MslMoreVert from 'virtual:icons/material-symbols-light/more-vert'
  import { getContext } from 'svelte'

  const { Icon } = getContext('app')

  let { 
    onSave = () => {} 
  } = $props()

  let colors = ['black', 'orange', 'red', 'lightblue', 'blue', 'green']
  let name = $state('')
  let isShareable = $state(false)
  let drawing = false
  let color = $state('black')
  let diceColor = $state('hsl(210 80% 45%)')
  let prevX = 0
  let prevY = 0
  let canvas = $state(null)

  function preventSelect(event) {
    event.preventDefault()
  }

  function rollColor() {
    const h = Math.floor(Math.random() * 360)
    const s = 55 + Math.floor(Math.random() * 36)
    const l = 32 + Math.floor(Math.random() * 21)
    color = diceColor = `hsl(${h} ${s}% ${l}%)`
  }

  async function handleSave () {
    const dataURL = canvas.toDataURL()

    const newIcon = await Icon.uploadDataURL({
      id: randomID(),
      iconObject: {
        createdBy: $user.uid,
        name,
        dataURL,
        isShareable
      }
    })
    onSave(newIcon)
    clearBoard()
  }

  function handleStart(event) {
    event.preventDefault()
    window.getSelection()?.removeAllRanges()
    document.addEventListener('selectstart', preventSelect)
    canvas.setPointerCapture(event.pointerId)
    drawing = true
    draw(event)
  }

  function handleEnd(event) {
    event.preventDefault()
    document.removeEventListener('selectstart', preventSelect)
    window.getSelection()?.removeAllRanges()
    drawing = false
    prevX = 0
    prevY = 0
    if (canvas?.hasPointerCapture?.(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId)
    }
  }

  function handleMove(event) {
    event.preventDefault()
    if (!drawing) return
    draw(event)
  }

  function draw(event) {
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.strokeStyle = color
    ctx.lineWidth = 6

    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

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
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    name = ''
    isShareable = false
  }
</script>

<IconDetailLayout>
  <div class="select-none [-webkit-touch-callout:none]">
    <div class="flex items-center justify-between gap-2 mb-2 w-[280px]">
      <div class="flex items-center justify-around flex-1">
        {#each colors as pencilColor (pencilColor)}
          <div
            class={[
              'size-6 cursor-pointer rounded-full transition-transform',
              color === pencilColor && 'relative z-10 scale-110 drop-shadow-md'
            ]}
            onclick={() => (color = pencilColor)}
            style="background-color: {pencilColor}"
          ></div>
        {/each}
        <div
          class={[
            'flex items-center justify-center text-[28px] cursor-pointer transition-transform',
            !colors.includes(color) && 'relative z-10 scale-110 drop-shadow-md'
          ]}
          onclick={rollColor}
          style:color={diceColor}
        >
          <MslCasino />
        </div>
      </div>
      <PopoverMenu>
        {#snippet activator ({ id, anchorName })}
          <button
            popovertarget={id}
            style:anchor-name={anchorName}
            class="shrink-0 flex text-lg text-[var(--fine-control-color,#64748b)]"
            title="More"
          >
            <MslMoreVert />
          </button>
        {/snippet}
        {#snippet content ({ close })}
          <div class="flex flex-col p-2 gap-y-2">
            <button
              onclick={() => { clearBoard(); close() }}
              class="text-left gap-x-[6px] text-neutral-600"
            >
              Wipe board
            </button>
          </div>
        {/snippet}
      </PopoverMenu>
    </div>

    <canvas
      bind:this={canvas}
      id="whiteboard"
      class="border border-solid border-black cursor-crosshair touch-none select-none [-webkit-touch-callout:none]"
      width="240"
      height="240"
      onpointerdown={handleStart}
      onpointerup={handleEnd}
      onpointermove={handleMove}
      onpointercancel={handleEnd}
      onlostpointercapture={handleEnd}
    >
    </canvas>
  </div>

  {#snippet meta()}
    <input
      class="w-full select-text"
      bind:value={name}
      placeholder="Icon name..."
    />
    <CheckboxSquare
      value={isShareable}
      onClick={() => (isShareable = !isShareable)}
      label="Public"
    />
    <button onclick={handleSave}
      class="px-4 py-2 border border-solid border-[#3b82f6] rounded-md font-medium bg-[#3b82f6] text-white disabled:bg-[#9ca3af] disabled:border-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-70"
      disabled={!name}
    >
      Save
    </button>
  {/snippet}
</IconDetailLayout>
