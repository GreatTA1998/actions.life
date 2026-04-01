<script>
  import ToggleGroupStyled from '$lib/components/ToggleGroupStyled.svelte'
  let {
    onselect,
    options = [],
    activeValue
  } = $props()
</script>

<ToggleGroupStyled>
  {#each options as option}
    <button onclick={() => onselect(option.value)} 
      class={[
        'py-2 px-1 text-[#6e6e7a] rounded text-sm',
        option.value === activeValue && 'bg-[#e3e6ee] text-[#1a1a1a] font-medium'
      ]}
      class:active={option.value === activeValue}
    >
      {option.text}
    </button>
  {/each}
</ToggleGroupStyled>