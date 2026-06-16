<script>
  let {
    onselect,
    options = [],
    activeValue
  } = $props()
</script>

<div class="flex gap-x-2 bg-[#f6f6f7] rounded-md">
  {#each options as option}
    <button onclick={() => onselect(option.value)} 
      class={[
        'p-2 text-[#6e6e7a] rounded',
        option.value === activeValue && 'bg-[#e3e6ee] text-[#1a1a1a] font-medium'
      ]}
    >
      {option.text}
    </button>
  {/each}
</div>