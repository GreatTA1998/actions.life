<script>
  import { user } from '$lib/store'
  import { getContext } from 'svelte'

  const { User } = getContext('app')
  
  let isSimple = $derived($user.simpleMode)
</script>

<div class="flex flex-col gap-y-2">
  <div class="flex w-fit bg-black/5 border border-solid border-black/5 rounded-lg">
    <button onclick={() => User.update({ simpleMode: true })} 
      class={[
        'text-gray-600 font-medium py-1 px-4 rounded-md text-sm',
        isSimple && 'bg-white core-shadow cast-shadow'
      ]}
    >
      Simple Mode
    </button>
    <button onclick={() => User.update({ simpleMode: false })} 
      class={[
        'text-gray-600 font-medium py-1 px-4 rounded-md text-sm',
        !isSimple && 'bg-white core-shadow cast-shadow'
      ]}
    >
      Structured Mode
    </button>
  </div>

  <div class="text-sm text-gray-600 px-1 leading-[1.5]">
    {#if isSimple}
      Tasks move between list and calendar, and are auto-archived when completed.
    {:else}
      Tasks stay visible on the list until archived.
    {/if}
  </div>
</div>
