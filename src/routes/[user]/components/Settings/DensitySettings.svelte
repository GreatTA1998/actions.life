<script>
  import { user } from '$lib/store'
  import { getContext } from 'svelte'
  import { calendarDensity } from '$lib/utils/constants.js'

  const { User } = getContext('app')
</script>

<div class="flex w-fit bg-black/5 border border-solid border-black/5 rounded-lg">
  {#each Object.entries(calendarDensity) as [key, { pixelsPerHour, calColumnWidth }] (key)}
    <button
      onclick={() => User.update({ pixelsPerHour, calColumnWidth })}
      class={[
        'capitalize text-gray-600 font-medium py-1 px-4 rounded-md text-sm',
        $user.pixelsPerHour === pixelsPerHour && 'bg-white core-shadow cast-shadow'
      ]}
    >
      {key}
    </button>
  {/each}
</div>
