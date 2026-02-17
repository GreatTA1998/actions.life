<script>
  import DaysOfWeekInput from './DaysOfWeekInput.svelte'
  import { nth, parse } from '$lib/utils/rrule.js'
  import { getContext, onMount } from 'svelte'
  import { SvelteSet } from 'svelte/reactivity'

  let { onChange = () => {} } = $props()

  const inputStates = getContext('inputStates')

  const weeks = [1, 2, 3, 4]
  let pickedDays = $state(new SvelteSet([]))
  let pickedWeeks = $state(new SvelteSet([1]))

  $effect(() => onChange(rrStr([...pickedWeeks], [...pickedDays])))

  onMount(() => {
    if ($inputStates.monthlyTypeII) {
      const { weeks, days } = parse($inputStates.monthlyTypeII)
      pickedDays = new SvelteSet(days)
      pickedWeeks = new SvelteSet(weeks)
    }
  })

  function rrStr (weeks, days) {
    if (!weeks.length || !days.length) return ''
    const bydays = [...weeks].sort((a, b) => a - b)
      .flatMap(w => days.map(d => `+${w}${d}`))
    return `FREQ=MONTHLY;BYDAY=${bydays.join(',')}`
  }

  function toggle (set, elem) {
    set.delete(elem) || set.add(elem)
  }
</script>
  
<div class="w-full flex flex-col gap-4 p-4">  
  <div class="flex items-center gap-3">
    <span>Every</span>
    <div class="flex flex-wrap gap-2">
      {#each weeks as w}
        <button onclick={() => toggle(pickedWeeks, w)}
          class={[
            'w-8 h-8 font-medium text-base border-b-2 border-b-solid',
            pickedWeeks.has(w) ? 'text-[var(--active)] border-b-[var(--active)]' : 'text-[#aaa] border-b-gray-300'
          ]}
        >
          {nth[w]}
        </button>
      {/each}
    </div>
  </div>

  <DaysOfWeekInput {pickedDays}
    onClick={day => toggle(pickedDays, day)}
  />

  <div class="ml-auto mr-0">
    of each month
  </div>
</div>