<script>
  import Tabs from '$lib/components/Tabs.svelte'
  import WeeklyInput from './WeeklyInput.svelte'
  import MonthlyInput from './MonthlyInput.svelte'
  import YearlyInput from './YearlyInput.svelte'
  import { 
    activeTab,
    inputStates, overallSourceOfTruth, monthlyInputSourceOfTruth, 
    pendingRRStr 
  } from './store.js'
  import { template } from '../../store.js'
  import { onMount } from 'svelte'
  import { parseRecurrenceString } from '../../recurrenceParser.js'

  const tabItems = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' }
  ]

  // dangerous but works. note: must be ordered before `handleNewInput()`
  $: if ($activeTab === 'monthly') {
    overallSourceOfTruth.set($monthlyInputSourceOfTruth)
  }
  $: handleNewInput($inputStates, $overallSourceOfTruth)

  $: if ($template) {
    pendingRRStr.set($template.rrStr || '')
  }

  onMount(() => {
    $activeTab = determineRecurrenceType($template.rrStr)
    const { monthlyInput, overall } = getSourceOfTruth($template.rrStr)
    monthlyInputSourceOfTruth.set(monthlyInput)
    overallSourceOfTruth.set(overall)

    inputStates.update(states => ({ ...states, [$overallSourceOfTruth]: $template.rrStr }))
    pendingRRStr.set($template.rrStr)
  })

  function determineRecurrenceType (rrStr) {
    const parsedData = parseRecurrenceString(rrStr)
    return parsedData.type
  }

  function getSourceOfTruth (rrStr) {
    if (!rrStr) {
      return {
        monthlyInput: 'monthlyTypeI',
        overall: 'weekly'
      }
    }

    const rrLower = rrStr.toLowerCase()
    let overall = 'weekly'
    let monthlyInput = 'monthlyTypeI'

    if (rrLower.includes('freq=monthly') || (!rrLower.includes('freq=') && rrLower.includes('bymonthday'))) {
      overall = 'monthly'
    } else if (rrLower.includes('freq=yearly') || (!rrLower.includes('freq=') && rrLower.includes('bymonth'))) {
      overall = 'yearly'
    }

    if (overall === 'monthly') {
      if (rrLower.includes('byday') && (rrLower.includes('bysetpos') || rrLower.includes('byweekno'))) {
        monthlyInput = 'monthlyTypeII'
      } else {
        monthlyInput = 'monthlyTypeI'
      }
    }

    return { monthlyInput, overall }
  }

  function handleNewInput () {
    pendingRRStr.set($inputStates[$overallSourceOfTruth])
  }

  function handleTabChange (e) {
    const { tab } = e.detail
    activeTab.set(tab)

    if (tab === 'weekly') overallSourceOfTruth.set('weekly')
    else if (tab === 'monthly') overallSourceOfTruth.set($monthlyInputSourceOfTruth)
    else if (tab === 'yearly') overallSourceOfTruth.set('yearly')
  }
</script>

<div style="display: flex; flex-direction: column; margin-top: 24px;">
  <Tabs tabs={tabItems} activeTab={$activeTab} on:tabChange={handleTabChange} />

  {#if $activeTab === 'weekly'}
    <WeeklyInput />
  {:else if $activeTab === 'monthly'}
    <MonthlyInput />
  {:else if $activeTab === 'yearly'}
    <YearlyInput template={$template} />
  {/if}
</div>