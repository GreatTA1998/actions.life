<script>
  import Slider from '$lib/components/Slider.svelte'
  import { user } from '$lib/store'
  import { getContext } from 'svelte'

  const { User } = getContext('app')

  const scales = [0.75, 0.875, 1, 1.125, 1.25]

  let index = $derived.by(() => {
    const i = scales.indexOf($user.fontScale)
    return i === -1 ? 1 : i
  })

  function setScale(e) {
    User.update({ fontScale: scales[Number(e.target.value)] })
  }
</script>

<div class="flex items-center gap-1.5 px-1 text-gray-600">
  <span class="text-sm">A</span>

  <Slider value={index}
    min={0} max={4} ticks={5}
    class="w-[240px]"
    onchange={setScale}
  />

  <span class="text-lg">A</span>
</div>