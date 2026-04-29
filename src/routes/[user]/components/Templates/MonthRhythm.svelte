<script>
  import { nth, parse } from '$lib/utils/rrule.js'

  let { rrStr = '' } = $props()

  const dayLabels = { MO: 'Mon', TU: 'Tue', WE: 'Wed', TH: 'Thu', FR: 'Fri', SA: 'Sat', SU: 'Sun' }
  
  let selectedDays = $state([])
  let isWeeklyPattern = $state(false)
  let weeklyDescription = $state('')
  let daysText = $derived(selectedDays.map(day => day === -1 ? 'last day' : `${day}${suffix(day)}`).join(', '))

  $effect(() => updateVariables(rrStr))

  function updateVariables () {
    if (rrStr.includes('FREQ=MONTHLY') && rrStr.includes('BYDAY=')) {
      isWeeklyPattern = true
      weeklyDescription = describeTypeII(rrStr)
      selectedDays = []
    } 
    else {
      isWeeklyPattern = false
      selectedDays = parse(rrStr)
    }
  }
  
  function describeTypeII (rrStr) {
    const { weeks, days } = parse(rrStr)
    if (!weeks.length || !days.length) return 'Not scheduled'

    const positions = weeks.sort((a, b) => a - b).map(w => nth[w])
    const posText = positions.length <= 2
      ? positions.join(' & ')
      : `${positions.slice(0, -1).join(', ')} & ${positions.at(-1)}`

    return `${posText} ${dayLabels[days[0]] ?? days[0]}`
  }

  function suffix (num) {
    if ([11, 12, 13].includes(num)) return 'th'
    switch (num % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }
</script>

<div class="w-[120px] flex flex-col px-1">
  {#if isWeeklyPattern}
    <div class="mt-1 text-xs text-neutral-600">
      {weeklyDescription}
    </div>
  {:else}
    <div class="h-0.5 relative bg-gray-200 my-2">
      {#each selectedDays as day}
        <div style:left="calc({day === -1 ? 100 : day / 31 * 100}%)"
          class="absolute -top-0.5 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--rhythm-highlight-color)]"
        >
        </div>
      {/each}
    </div>
    <div class="text-xs text-neutral-600">
      {daysText}
    </div>
  {/if}
</div>