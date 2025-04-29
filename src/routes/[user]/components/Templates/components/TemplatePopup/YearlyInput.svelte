<script>
  import MyJSDatePicker from '$lib/components/MyJSDatePicker.svelte'
  import { onMount } from 'svelte'
  import { getContext } from 'svelte'

  const inputStates = getContext('inputStates')

  let selectedMMDD = ''
  let selectedYear = ''

  onMount(() => {
    const parsedDate = parseRRuleString($inputStates.yearly)
    if (parsedDate) {
      selectedMMDD = parsedDate.mmdd
      selectedYear = parsedDate.year
    }
  })

  function parseRRuleString(rrStr) {
    if (!rrStr || !rrStr.includes('FREQ=YEARLY')) return null
    
    const bymonthdayMatch = rrStr.match(/BYMONTHDAY=(\d+)/)
    const bymonthMatch = rrStr.match(/BYMONTH=(\d+)/)
    
    if (bymonthdayMatch && bymonthMatch) {
      const day = parseInt(bymonthdayMatch[1])
      const month = parseInt(bymonthMatch[1])
      // Format as MM/DD
      const mmdd = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`
      return { mmdd, year: new Date().getFullYear().toString() }
    }
    
    return null
  }

  function createRRuleFromDate(mmdd) {
    if (!mmdd) return ''
    
    const [month, day] = mmdd.split('/').map(part => parseInt(part))
    return `FREQ=YEARLY;BYMONTH=${month};BYMONTHDAY=${day}`
  }

  function handleDateSelected (e) {
    selectedMMDD = e.detail.selectedDate
    selectedYear = e.detail.selectedYear

    inputStates.update(states => ({ 
      ...states,
      yearly: createRRuleFromDate(selectedMMDD), // NOTE: must be AFTER states, otherwise it gets overriden
    }))
  }
</script>

<div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
  <MyJSDatePicker
    MMDD={selectedMMDD || ''}
    YYYY={selectedYear || ''}
    on:date-selected={handleDateSelected}
  />
  every year
</div>