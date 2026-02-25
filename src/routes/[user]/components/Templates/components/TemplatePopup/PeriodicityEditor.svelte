<script>
  import PeriodicityInputs from './PeriodicityInputs.svelte'
  import PreviewChanges from './PreviewChanges.svelte'
  import RoundButton from '$lib/components/RoundButton.svelte'
  import Template from '$lib/db/models/Template.js'
  import Task from '$lib/db/models/Task.js' // note Task from context is now corrupted by Template
  import { getPreviewSpan, generateRecurrenceDTs } from '$lib/utils/rrule.js'
  import { getAffectedInstances } from './instances.js'
  import { getRandomID } from '$lib/utils/core.js'
  import { DateTime } from 'luxon'

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

    const affectedTasks = await getAffectedInstances(routine)
    
    resetPreviewStates()
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

    return DTs.map(dt => 
      Task.schema.parse({
        ...routine,
        templateID: routine.id,
        startDateISO: dt.toFormat('yyyy-MM-dd'),
        isArchived: true,
        parentID: ''
      })
    )
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
    Template.update({ id: routine.id, kvChanges: { 
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

  // flawed, should also handle changed dates that falls outside of the original schedule
  // for example, if it routine repeats MWF, but the task is scheduled for Thursday, it was modified
  function isException (task, template) {
    if (!task || !template) return false
    
    for (const k of Object.keys(task)) {
      if (['notes', 'imageDownloadURL', 'iconURL'].includes(k)) {      
        if (task[k] !== template[k]) { 
          return true
        }
      }
    }
    return false
  }

  function resetPreviewStates() {
    deletingTasks = []
    addingTasks = []
    exceptions = []
  }
</script>

<div class="grid gap-y-4">
  {#key routine.rrStr}  
    <PeriodicityInputs 
      initialRRStr={routine.rrStr}
      updateRR={newVal => pendingRRStr = newVal}
    />
  {/key}

  {#if pendingRRStr !== routine.rrStr}
    <div class="grid gap-y-4">
      {#if !isCreating}
        <PreviewChanges {pendingRRStr} 
          {addingTasks} 
          {deletingTasks} 
          {exceptions}
        />
      {/if}

      {#if isCreating}
        <RoundButton onclick={handleCreate}>Create routine</RoundButton>
      {:else}
        <RoundButton onclick={handleUpdate}>Apply changes</RoundButton>
      {/if}
    </div>
  {/if}
</div>