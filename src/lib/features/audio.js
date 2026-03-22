const SOUNDS = {
  tap:         '/sounds/type_01.wav',
  celebration: '/sounds/celebration.wav',
  swipe: '/sounds/swipe_01.wav'
}

let ctx = null
const buffers = {}

export function playSound (name, volume = 1) {
  const src = ctx.createBufferSource()
  const gainNode = ctx.createGain()
  gainNode.gain.value = volume

  src.buffer = buffers[name]
  src.connect(gainNode)
  gainNode.connect(ctx.destination)
  src.start(0)
}

export async function loadSounds () {
  ctx = new AudioContext()
  await Promise.all(
    Object.entries(SOUNDS).map(async ([name, path]) => {
      const res = await fetch(path)
      buffers[name] = await ctx.decodeAudioData(await res.arrayBuffer())
    })
  )
}