<script>
  import { user } from '$lib/store'
  import { getContext } from 'svelte'

  const { User } = getContext('app')

  const scales = [
    { value: 0.75, label: 'Small' },
    { value: 1, label: 'Standard' },
    { value: 1.25, label: 'Large' },
  ]
</script>

<div class="flex items-center gap-2 w-fit">
  <span class="text-xs font-medium text-gray-500 leading-none select-none">A</span>

  <div class="flex bg-black/5 border border-solid border-black/5 rounded-lg">
    {#each scales as { value, label } (value)}
      <button
        onclick={() => User.update({ fontScale: value })}
        class={[
          'text-gray-600 font-medium py-1 px-2.5 rounded-md text-sm tabular-nums',
          $user.fontScale === value && 'bg-white core-shadow cast-shadow'
        ]}
      >
        {label}
      </button>
    {/each}
  </div>

  <span class="text-lg font-medium text-gray-500 leading-none select-none">A</span>
</div>
