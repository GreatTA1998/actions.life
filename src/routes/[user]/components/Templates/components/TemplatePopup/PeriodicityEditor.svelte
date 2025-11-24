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

  export let routine
  export let isCreating = false

  let pendingRRStr = ''
  let deletingTasks = []
  let addingTasks = []
  let exceptions = []

  $: reactToRRStr(pendingRRStr) // TO-DO: make this explicit, it's a crucial detail to be exposed

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

    const newTasks = []
    for (const dt of DTs) {
      newTasks.push(
        instantiateTask({ template: routine, dt })
      )
    }
    return newTasks
  }

  async function handleCreate () {
    propagateChanges()
    Template.create({
      id: routine.id,
      newTemplate: { ...routine, rrStr: pendingRRStr }
    })
    Task.update({ id: routine.id, keyValueChanges: {
      templateID: routine.id
    }})
  }
  
  async function handleUpdate () {
    propagateChanges()
    Template.update({ id: routine.id, updates: { 
      rrStr: pendingRRStr, 
      previewSpan: getPreviewSpan(pendingRRStr),
      prevEndISO: DateTime.now().plus({ days: getPreviewSpan(pendingRRStr) }).toFormat('yyyy-MM-dd')
    }})
  }

  function propagateChanges () {
    for (const task of deletingTasks) {
      Task.delete({ id: task.id })
    }
    for (const task of addingTasks) {
      Task.create({ id: getRandomID(), newTaskObj: task })
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
    <div class="changes-section">
      {#if !isCreating}
        <PreviewChanges {pendingRRStr} {addingTasks} {deletingTasks} {exceptions}/>
      {/if}

      <div class="action-button-container">
        {#if isCreating}
          <RoundButton on:click={handleCreate} backgroundColor="rgb(0, 89, 125)" textColor="white">
            Create routine
          </RoundButton>
        {:else}
          <RoundButton on:click={handleUpdate} backgroundColor="rgb(0, 89, 125)" textColor="white">
            Apply changes
          </RoundButton>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .changes-section {
    margin-top: 24px;
    width: 100%;
  }

  .action-button-container {
    display: flex;
    justify-content: flex-start;
    margin-top: 16px;
  }
</style>