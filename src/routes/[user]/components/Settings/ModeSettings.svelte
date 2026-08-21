<script>
  import { user } from '$lib/store'
  import { getContext } from 'svelte'
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import MsInfoOutline from 'virtual:icons/material-symbols/info-outline'

  const { User } = getContext('app')
  
  let isSimple = $derived($user.simpleMode)
</script>

<div class="flex items-center gap-x-2">
  <div class="flex w-fit bg-black/5 border border-solid border-black/5 rounded-lg">
    <button onclick={() => User.update({ simpleMode: true })} 
      class={[
        'text-gray-600 font-medium py-1 px-4 rounded-md text-sm',
        isSimple && 'bg-white core-shadow cast-shadow'
      ]}
    >
      Simple
    </button>
    <button onclick={() => User.update({ simpleMode: false })} 
      class={[
        'text-gray-600 font-medium py-1 px-4 rounded-md text-sm',
        !isSimple && 'bg-white core-shadow cast-shadow'
      ]}
    >
      Structured
    </button>
  </div>

  <PopoverMenu>
    {#snippet activator ({ id, anchorName })}
      <button popovertarget={id} style:anchor-name={anchorName}
        class="text-gray-600 flex items-center"
      >
        <MsInfoOutline style="font-size: 1rem" />
      </button>
    {/snippet}

    {#snippet content ()}
      <div class="flex flex-col gap-y-2.5 px-3 py-2.5 max-w-sm text-sm text-gray-600 leading-[1.5]">
        <div>
          <div class="font-medium text-gray-700">Simple mode</div>
          <div>Tasks auto-archive from the to-do list when scheduled/completed</div>
        </div>
        <div>
          <div class="font-medium text-gray-700">Structured mode</div>
          <div>Tasks remain on the to-do list until manually archived</div>
        </div>
      </div>
    {/snippet}
  </PopoverMenu>
</div>
