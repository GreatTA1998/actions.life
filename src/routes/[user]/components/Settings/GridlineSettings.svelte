<script>
  import { calSnapInterval } from '$lib/store'
  import { getContext } from 'svelte'
  
  const { User } = getContext('app')
</script>

<div class="flex items-center gap-2">
  <div class="text-sm text-gray-600">
    Snap to nearest
  </div>

  <div class="flex bg-neutral-100/80 rounded-md p-1">
    {#each [1, 30] as interval}
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
