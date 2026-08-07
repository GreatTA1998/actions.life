<script>
  import { calSnapInterval } from '$lib/store'
  import { getContext } from 'svelte'
  
  const { User } = getContext('app')
</script>

<div class="flex items-center gap-2">
  <div class="text-sm text-gray-600">
    Snap to
  </div>

  <div class="flex bg-neutral-100/80 rounded-md p-1">
    {#each [1, 5, 30] as interval}
      <button 
        onclick={() => User.update({ calSnapInterval: interval })} 
        class={[
          'px-2 rounded py-1 text-sm text-gray-600',
          $calSnapInterval === interval && 'bg-white shadow-sm'
        ]}
      >
        {interval}
        min
      </button>
    {/each}
  </div>
</div>
