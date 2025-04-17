<script>
  import MyJSDatePicker from '$lib/components/MyJSDatePicker.svelte'
  import { inputStates } from './store.js'

  export let template

  let selectedMMDD = ''
  let selectedYear = ''

  $: {
    if (template && template.rrStr) {
      const parsedDate = parseRRuleString(template.rrStr)
      if (parsedDate) {
        selectedMMDD = parsedDate.mmdd
        selectedYear = parsedDate.year
      }
    }
  }

  $: {
    const currentRRule = createRRuleFromDate(selectedMMDD)
    
    inputStates.update(states => ({ ...states, yearly: currentRRule }))
  }

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

  function handleDateSelected(event) {
    selectedMMDD = event.detail.selectedDate
    selectedYear = event.detail.selectedYear
  }
</script>

<div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
  <MyJSDatePicker
    MMDD={selectedMMDD || '12/30'}
    YYYY={selectedYear || '2005'}
    placeholder="Nov 2"
    on:date-selected={handleDateSelected}
  />
  every year
</div>