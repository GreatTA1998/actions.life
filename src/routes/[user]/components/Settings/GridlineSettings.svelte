<script>
  import { calSnapInterval, user } from '$lib/store'
  import { getContext } from 'svelte'
  
  const { User } = getContext('app')

  const dense = $derived($user.pixelsPerHour === 40)
</script>

<div class="flex items-center gap-2">
  <div class="flex w-fit bg-black/5 border border-solid border-black/5 rounded-lg">
    <button 
      onclick={() => User.update({ 
        pixelsPerHour: 80,
        calColumnWidth: 260
      })} 
      class={[
        'text-gray-600 font-medium py-1 px-4 rounded-md text-sm',
        !dense && 'bg-white core-shadow cast-shadow'
      ]}
    >
      Normal
    </button>
    <button 
      onclick={() => User.update({ 
        pixelsPerHour: 40,
        calColumnWidth: 100
      })} 
      class={[
        'text-gray-600 font-medium py-1 px-4 rounded-md text-sm',
        dense && 'bg-white core-shadow cast-shadow'
      ]}
    >
      High density
    </button>
  </div>
</div>

<div class="flex items-center gap-2">
  <div class="text-sm text-gray-600">
    Snap to nearest
  </div>

  <div class="flex bg-neutral-100/80 rounded-md p-1">
    {#each [1, 5, 30] as interval}
      <button 
        onclick={() => User.update({ calSnapInterval: interval })} 
        class={[
          'w-8 rounded py-1 text-xs text-gray-600',
          $calSnapInterval === interval && 'bg-white shadow-sm'
        ]}
      >
        {interval}
      </button>
    {/each}
  </div>
  <span class="text-sm text-gray-600">
    minute interval
  </span>
</div>
