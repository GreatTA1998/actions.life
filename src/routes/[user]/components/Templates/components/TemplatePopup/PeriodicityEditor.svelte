<script>
  import PeriodicityInputs from './PeriodicityInputs.svelte'
  import PreviewChanges from './PreviewChanges.svelte'
  import RoundButton from '$lib/components/RoundButton.svelte'
  import Template from '$lib/db/models/Template.js'
  import Task from '$lib/db/models/Task.js' // note Task from context is now corrupted by Template
  import { getPreviewSpan, generateRecurrenceDTs } from '$lib/utils/rrule.js'
  import { getAffectedInstances } from './instances.js'
  import { randomID } from '$lib/utils/core.js'
  import { DateTime } from 'luxon'

  let { routine } = $props()

  let pendingRRStr = $state('')
  let deletingTasks = $state([])
  let addingTasks = $state([])
  let exceptions = $state([])

  $effect(() => reactTo(pendingRRStr))

  async function reactTo (pendingRRStr) {
    reset()
    
    if (pendingRRStr === routine.rrStr) return
    else {
      const affectedTasks = await getAffectedInstances(routine)
      for (const task of affectedTasks) {
        if (isException(task, routine)) exceptions = [...exceptions, task]
        else deletingTasks = [...deletingTasks, task]
      }
      addingTasks = simulateChanges(pendingRRStr)
    }
  }

  // TO-DO: fix this
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
        onList: false,
        parentID: ''
      })
    )
  }
  
  async function onUpdate () {
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
      Task.create({ id: randomID(), data: task })
    }
    reset()
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

  function reset () {
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
      <PreviewChanges {pendingRRStr} 
        {addingTasks} 
        {deletingTasks} 
        {exceptions}
      />

      <RoundButton onclick={onUpdate}>Apply changes</RoundButton>
    </div>
  {/if}
</div>