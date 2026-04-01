<script>  
  let { 
    pickedDays,
    onClick = () => {}
   } = $props()
  
  const days = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
</script>

<div class="flex gap-x-1">
  {#each days as d}
    <button onclick={() => onClick(d)}
      class={[
        'w-8 h-8 text-xs rounded-full select-none',
        pickedDays.has(d) ? 'bg-[var(--active)] text-white' : 'bg-white border border-solid border-gray-300'
      ]}
    >
      {d}
    </button>
  {/each}
</div>