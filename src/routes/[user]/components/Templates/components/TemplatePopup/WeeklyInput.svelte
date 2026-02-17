<script>
  import DaysOfWeekInput from './DaysOfWeekInput.svelte'
  import { getContext } from 'svelte'
  import { parse } from '$lib/utils/rrule.js'
  import { SvelteSet } from 'svelte/reactivity'

  const inputStates = getContext('inputStates')
  const days = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

  let pickedDays = $state(
    new SvelteSet(
      parse($inputStates.weekly)
    )
  )
  
  $effect(() => update(pickedDays))

  function update () {
    inputStates.update(states => ({ 
      ...states, 
      weekly: rrStr(days.filter(d => pickedDays.has(d)))
    }))
  }

  function rrStr (days) {
    return days.length ? `FREQ=WEEKLY;BYDAY=${days.join(',')}` : ''
  }

  function toggle (day) {
    pickedDays.delete(day) || pickedDays.add(day)
  }
</script>

<DaysOfWeekInput {pickedDays} 
  onClick={day => toggle(day)} 
/>