<script>
  import PeriodicityInputs from './PeriodicityInputs.svelte'
  import RoundButton from '$lib/components/RoundButton.svelte'
  import Template from '$lib/db/models/Template.js'
  import Task from '$lib/db/models/Task.js' // note Task from context is now corrupted by Template
  import { getPreviewSpan, generateRecurrenceDTs } from '$lib/utils/rrule.js'
  import { DateTime } from 'luxon'
  import { onMount } from 'svelte'

  let { routine } = $props()

  let pendingRRStr = $state('')
  let addingISOs = $derived.by(() => simulateChanges(pendingRRStr))

  let affectedTasks = $state([])
  let deletingTasks = $derived(affectedTasks.filter(task => !modified(task, routine)))
  let preservingTasks = $derived(affectedTasks.filter(task => modified(task, routine)))

  onMount(async () => {
    affectedTasks = await Template.getAffectedInstances(routine)
  })

  function simulateChanges (newRRStr) {
    if (!newRRStr) return []

    return generateRecurrenceDTs({
      startDT: DateTime.now(),
      endDT: DateTime.now().plus({ days: getPreviewSpan({ rrStr: newRRStr })}),
      rrStr: newRRStr
    }).map(dt => dt.toFormat('yyyy-MM-dd'))
  }
  
  async function applyChanges () {
    await Promise.all(
      deletingTasks.map(({ id }) => Task.delete({ id, willConfirm: false }))  
    )

    for (const iso of addingISOs) {
      Task.fromTemplate({
        template: routine,
        modifiers: {
          startDateISO: iso,
          onList: false
        }
      })
    }

    const previewSpan = getPreviewSpan({ rrStr: pendingRRStr })
    Template.update({ id: routine.id, kvChanges: { 
      rrStr: pendingRRStr, 
      previewSpan,
      prevEndISO: DateTime.utc().plus({ days: previewSpan }).toFormat('yyyy-MM-dd')
    }})
  }

  // flawed, should also handle changed dates that falls outside of the original schedule
  // for example, if it routine repeats MWF, but the task is scheduled for Thursday, it was modified
  function modified (task, template) {
    if (!task || !template) return false
    return ['notes', 'imageDownloadURL', 'iconURL']
      .some(k => task[k] !== template[k])
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
    <div class="grid gap-y-2">
      <div class="flex gap-x-4">
        <div class="flex flex-col gap-1">
          {#each addingISOs as iso (iso)}
            {@render item('+', 'text-[#36a76b]', iso)}
          {/each}
        </div>
    
        <div class="flex flex-col gap-1">
          {#each deletingTasks as task}   
            {@render item('-', 'text-[#e53e3e]', task.startDateISO)}
          {/each}
        </div>
    
        <div class="flex flex-col gap-1">
          {#each preservingTasks as task}
            {@render item('=', 'text-[darkblue]', task.startDateISO)}
          {/each}
        </div>
      </div>
    
      <div class="text-sm">
        {getPreviewSpan({ rrStr: pendingRRStr })} day preview
      </div>

      <RoundButton onclick={applyChanges}>Apply changes</RoundButton>
    </div>
  {/if}
</div>

{#snippet item (symbol, tailwindClass, startDateISO)}
  <div class={[tailwindClass, 'flex items-center text-xs gap-x-1']}>
    <span class="min-w-[8px]">{symbol}</span>
    <span class="font-medium">
      {DateTime.fromISO(startDateISO).toFormat('MMM d ccc')}
    </span>
  </div>
{/snippet}