<script>
  import PeriodicityInputs from './PeriodicityInputs.svelte'
  import PreviewChanges from './PreviewChanges.svelte'
  import RoundButton from '$lib/components/RoundButton.svelte'
  import Template from '$lib/db/models/Template.js'
  import { getPreviewSpan, generateRecurrenceDTs } from '$lib/utils/rrule.js'
  import { instantiateTask, isException, getAffectedInstances } from './instances.js'
  import { getRandomID } from '$lib/utils/core.js'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  let {
    routine,
    isCreating = false
  } = $props()

  let pendingRRStr = $state('')
  let deletingTasks = $state([])
  let addingTasks = $state([])
  let exceptions = $state([])

  $effect(() => reactToRRStr(pendingRRStr))

  async function reactToRRStr (pendingRRStr) {
    if (!routine || pendingRRStr === routine.rrStr) return
    resetPreviewStates()
    const affectedTasks = await getAffectedInstances(routine)
    for (const task of affectedTasks) {
      if (isException(task, routine)) exceptions = [...exceptions, task]
      else deletingTasks = [...deletingTasks, task]
    }
    addingTasks = simulateChanges(pendingRRStr)
  }

  function simulateChanges (newRRStr) {
    if (!newRRStr) return []
    const DTs = generateRecurrenceDTs({
      startDT: DateTime.now(),
      endDT: DateTime.now().plus({ days: getPreviewSpan({ rrStr: newRRStr })}),
      rrStr: newRRStr
    })

    return DTs.map(dt => instantiateTask({ template: routine, dt }))
  }

  async function handleCreate () {
    executeChanges()
    const previewSpan = getPreviewSpan({ rrStr: pendingRRStr })
    
    Template.create({
      id: routine.id,
      data: { 
        ...routine, 
        rrStr: pendingRRStr,
        previewSpan,
        prevEndISO: DateTime.utc().plus({ days: previewSpan }).toFormat('yyyy-MM-dd')
      }
    })

    Task.update({ id: routine.id, kvChanges: {
      templateID: routine.id
    }})
  }
  
  async function handleUpdate () {
    executeChanges()
    const previewSpan = getPreviewSpan({ rrStr: pendingRRStr })
    Template.update({ id: routine.id, updates: { 
      rrStr: pendingRRStr, 
      previewSpan,
      prevEndISO: DateTime.utc().plus({ days: previewSpan }).toFormat('yyyy-MM-dd')
    }})
  }

  function executeChanges () {
    for (const task of deletingTasks) {
      Task.delete({ id: task.id })
    }
    for (const task of addingTasks) {
      Task.create({ id: getRandomID(), data: task })
    }
    resetPreviewStates()
  }

  function resetPreviewStates() {
    deletingTasks = []
    addingTasks = []
    exceptions = []
  }
</script>

<div>
  <PeriodicityInputs 
    initialRRStr={routine.rrStr}
    on:update-rr={e => pendingRRStr = e.detail}
  />

  {#if pendingRRStr !== routine.rrStr}
    <div class="w-full mt-6">
      {#if !isCreating}
        <PreviewChanges {pendingRRStr} {addingTasks} {deletingTasks} {exceptions}/>
      {/if}

      <div class="flex justify-start mt-4">
        {#if isCreating}
          <RoundButton onclick={handleCreate} backgroundColor="rgb(0, 89, 125)" textColor="white">
            Create routine
          </RoundButton>
        {:else}
          <RoundButton onclick={handleUpdate} backgroundColor="rgb(0, 89, 125)" textColor="white">
            Apply changes
          </RoundButton>
        {/if}
      </div>
    </div>
  {/if}
</div>