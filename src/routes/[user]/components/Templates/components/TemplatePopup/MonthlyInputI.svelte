<script>
  import { getContext } from 'svelte'
  import { SvelteSet } from 'svelte/reactivity'
  import { parse } from '$lib/utils/rrule.js'

  let { onChange = () => {} } = $props()
  const inputStates = getContext('inputStates')
  
  let pickedDays = $state(
    new SvelteSet(parse($inputStates.monthlyTypeI))
  )
  $effect(() => onChange(rrStr(pickedDays)))

  function rrStr (set) {
    if (set.size === 0) return ''
    else {
      const days = Array.from(set).sort((a, b) => a - b)
      return `FREQ=MONTHLY;BYMONTHDAY=${days.join(',')}`
    }
  }
  
  function toggle (day) {
    pickedDays.delete(day) || pickedDays.add(day)
  }
</script>

<div class="w-full grid grid-cols-7 gap-0.5 p-3 mx-auto">
  {#each Array(28) as _, i}
    <button onclick={() => toggle(i+1)} class={{ 'selected': pickedDays.has(i+1) }}>
      {i+1}
    </button>
  {/each}
  
  <button onclick={() => toggle(-1)} class={{ 'selected': pickedDays.has(-1) }}>
    L
  </button>
</div>

<style>  
  button {
    width: 38px;
    height: 38px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .selected {
    background: var(--active);
    color: white;
  }
</style> 