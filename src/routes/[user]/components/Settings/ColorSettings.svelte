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
        'size-7 rounded-lg border border-solid border-black/10',
        $user.calendarTheme === name && 'scale-110 core-shadow cast-shadow'
      ]}
    >
    </button>
  {/each}
</div>