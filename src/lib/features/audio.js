const SOUNDS = {
  tap:         '/sounds/type_01.wav',
  celebration: '/sounds/celebration.wav'
}

let ctx = null
const buffers = {}

export function playSound (name) {
  const src = ctx.createBufferSource()
  src.buffer = buffers[name]
  src.connect(ctx.destination)
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