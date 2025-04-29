<script>
  // CORRECTNESS ARGUMENT: overallPointer & monthlyPointer are correct, inputStates are owned by each input component
  import WeeklyInput from './WeeklyInput.svelte'
  import MonthlyInput from './MonthlyInput.svelte'
  import YearlyInput from './YearlyInput.svelte'
  import Tabs from '$lib/components/Tabs.svelte'
  import { getPeriodicity } from '../../recurrenceParser.js'
  import { onMount, setContext, createEventDispatcher } from 'svelte'
  import { writable } from 'svelte/store'

  export let initialRRStr = ''

  let overallPointer = 'weekly'

  let activeTab = 'weekly'
  const tabItems = [{ label: 'Weekly', value: 'weekly' }, { label: 'Monthly', value: 'monthly' }, { label: 'Yearly', value: 'yearly' }]

  const inputStates = writable({ 
    weekly: '', // everything is `rrStr`
    monthlyTypeI: '',
    monthlyTypeII: '',
    yearly: ''
  })
  const monthlyPointer = writable('monthlyTypeI')

  setContext('inputStates', inputStates)
  setContext('monthlyPointer', monthlyPointer)

  let loaded = false // quickfix to prevent uninitialized input states / timing problems
  const dispatch = createEventDispatcher()

  $: overallPointer = activeInputChanged(activeTab, $monthlyPointer)
  $: dispatch('update-rr', $inputStates[overallPointer])

  onMount(() => {
    activeTab = getPeriodicity(initialRRStr)
    initPointers(initialRRStr)
    inputStates.update(states => ({ ...states, [overallPointer]: initialRRStr }))
    loaded = true
  })

  function initPointers (rrStr) {
    const rr = rrStr.toLowerCase()

    if (rr.includes('freq=monthly')) {
      if (rr.includes('bymonthday')) monthlyPointer.set('monthlyTypeI')
      else if (rr.includes('byday')) monthlyPointer.set('monthlyTypeII') 

      overallPointer = $monthlyPointer
    } 
    else if (rr.includes('freq=yearly')) {
      overallPointer = 'yearly'
    }
  }

  function activeInputChanged () {
    if (activeTab === 'weekly') return 'weekly'
    else if (activeTab === 'monthly') return $monthlyPointer
    else if (activeTab === 'yearly') return 'yearly'
  }
</script>

{#if loaded}
  <div style="display: flex; flex-direction: column; margin-top: 24px;">
    <Tabs tabs={tabItems} activeTab={activeTab} on:tabChange={e => activeTab = e.detail.tab}/>

    {#if activeTab === 'weekly'}
      <WeeklyInput />
    {:else if activeTab === 'monthly'}
      <MonthlyInput />
    {:else if activeTab === 'yearly'}
      <YearlyInput />
    {/if}
  </div>
{/if}