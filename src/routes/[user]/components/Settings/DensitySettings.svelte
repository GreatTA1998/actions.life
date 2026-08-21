<script>
  import { user } from '$lib/store'
  import { getContext } from 'svelte'

  const { User } = getContext('app')
</script>

<div class="flex w-fit bg-black/5 border border-solid border-black/5 rounded-lg">
  <button 
    onclick={() => User.update({ 
      pixelsPerHour: 80,
      calColumnWidth: 260 // 8 habits
    })} 
    class={[
      'text-gray-600 font-medium py-1 px-4 rounded-md text-sm',
      $user.pixelsPerHour === 80 && 'bg-white core-shadow cast-shadow'
    ]}
  >
    Wide
  </button>
  <button 
    onclick={() => User.update({ 
      pixelsPerHour: 50, 
      calColumnWidth: 160 // 5 habits
    })} 
    class={[
      'text-gray-600 font-medium py-1 px-4 rounded-md text-sm',
      $user.pixelsPerHour === 50 && 'bg-white core-shadow cast-shadow'
    ]}
  >
    Dense
  </button>
  <button 
    onclick={() => User.update({ 
      pixelsPerHour: 31, 
      calColumnWidth: 100 // 3 habits
    })} 
    class={[
      'text-gray-600 font-medium py-1 px-4 rounded-md text-sm',
      $user.pixelsPerHour === 31 && 'bg-white core-shadow cast-shadow'
    ]}
  >
    Mini
  </button>
</div>