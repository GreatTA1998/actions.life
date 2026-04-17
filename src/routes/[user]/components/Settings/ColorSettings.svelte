<script>
  import { user } from '$lib/store'
  import { themes } from '$lib/store/themes'
  import { getContext } from 'svelte'

  const { User } = getContext('app')
</script>

<div class="flex gap-x-2">
  {#each Object.entries(themes) as [name, colors]}
    <button onclick={() => User.update({ calendarTheme: name })} 
      style:background-color={colors.previewColor}
      class={[
        'size-7 rounded-lg border border-solid',
        $user.calendarTheme === name ? 'scale-110 shadow-lg border-black/20': 'opacity-50 border-black/10'
      ]}
    >
    </button>
  {/each}
</div>