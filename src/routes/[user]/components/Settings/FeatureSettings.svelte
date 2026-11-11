<script>
  import { user } from '$lib/store'
  import { getContext } from 'svelte'

  const { User } = getContext('app')

  const chips = [
    { key: 'scheduleEnabled', label: 'Schedule' },
    { key: 'repeatEnabled', label: 'Repeat' },
    { key: 'photoEnabled', label: 'Photo' },
  ]

  function toggle (key) {
    User.update({ [key]: $user[key] === false })
  }
</script>

<div class="flex w-fit items-center gap-1 rounded-lg border border-solid border-black/5 bg-black/5 p-1">
  {#each chips as chip (chip.key)}
    <button
      onclick={() => toggle(chip.key)}
      class={[
        'rounded-md px-3 py-1 text-sm font-medium',
        $user[chip.key] !== false
          ? 'bg-white text-gray-700 core-shadow cast-shadow'
          : 'text-gray-400'
      ]}
    >
      {chip.label}
    </button>
  {/each}
</div>
