<script>
  // Correctness argument: 
  //   - the preview arrays use the same source of truth as the actual delete / addition operations
  //   - auto-generating (prevEndISO || today) + previewSpan (getOccurence uses rrule strings)

  import PeriodicityInputs from './PeriodicityInputs.svelte'
  import PreviewChanges from './PreviewChanges.svelte'
  import IconsDisplay from '../IconsDisplay/IconsDisplay.svelte'
  import BasePopup from '$lib/components/BasePopup.svelte'
  import RoundButton from '$lib/components/RoundButton.svelte'

  import { getPreviewSpan, isException } from './store.js'
  import { template, closeTemplateEditor } from '../../store.js'
  import { generateDates, instantiateTask } from '$lib/store/templateInstances.js'
  import { user } from '$lib/store'

  import Task from '$lib/db/models/Task'
  import Template from '$lib/db/models/Template.js'

  import { getRandomID, createDebouncedFunction } from '$lib/utils/core.js'
  import { getPeriodicity } from '../../recurrenceParser.js'
  import { db } from '$lib/db/init.js'
  import { collection, query, where, getDocs } from 'firebase/firestore'
  import { DateTime } from 'luxon'

  let pendingRRStr = ''
  let iconsMenu = false

  let deletingTasks = []
  let addingTasks = []
  let exceptions = []

  function resetPreviewStates() {
    deletingTasks = []
    addingTasks = []
    exceptions = []
  }

  $: reactToRRStr(pendingRRStr) // TO-DO: make this explicit, it's a crucial detail to be exposed

  async function reactToRRStr (pendingRRStr) {
    if (!$template) return

    resetPreviewStates()

    if (pendingRRStr === $template.rrStr) {
      return
    }

    const affectedTasks = await getAffectedTasks($template)
    for (const task of affectedTasks) {
      if (isException(task, $template)) exceptions = [...exceptions, task]
      else deletingTasks = [...deletingTasks, task]
    }

    addingTasks = simulateChanges(pendingRRStr)
  }

  function simulateChanges (newRRStr) {
    if (!newRRStr) return []
    const JSDates = generateDates({ 
      rrStr: newRRStr,
      previewSpan: getPreviewSpan(newRRStr),
      startISO: DateTime.now().toFormat('yyyy-MM-dd') // always from today, as this is a Routine EDIT
    })

    const newTasks = []
    for (const JSDate of JSDates) {
      newTasks.push(
        instantiateTask({ template: $template, occurence: JSDate })
      )
    }
    return newTasks
  }
  
  async function handleSave () {
    if (pendingRRStr === $template.rrStr) return

    for (const task of deletingTasks) {
      Task.delete({ id: task.id, willConfirm: false })
    }
    for (const task of addingTasks) {
      Task.create({ id: getRandomID(), newTaskObj: task })
    }
    Template.update({ id: $template.id, updates: { 
      rrStr: pendingRRStr, 
      previewSpan: getPreviewSpan(pendingRRStr),
      prevEndISO: DateTime.now().plus({ days: getPreviewSpan(pendingRRStr) }).toFormat('yyyy-MM-dd')
    }})
    resetPreviewStates()
  }

  async function getAffectedTasks (template) {
    const tasksQuery = query(
      collection(db, 'users', $user.uid, 'tasks'),
      where('templateID', '==', template.id),
      where('startDateISO', '>=', DateTime.now().toFormat('yyyy-MM-dd'))
    )
    const tasksSnapshot = await getDocs(tasksQuery)
    return tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}))
  }

  function handleDelete () {
    if (confirm('Are you sure you want to delete this template?')) {
      // deleteTemplate({ templateID: $template.id })
      closeTemplateEditor()
    }
  }

  function formatTime(minutes) {
    if (minutes < 60) return `${Math.round(minutes)} minutes`
    const hours = Math.round(minutes / 60)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  }
</script>

<BasePopup on:click-outside={closeTemplateEditor}>
  <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
    {#if $template.iconURL && getPeriodicity(pendingRRStr) === 'weekly'}
      <button on:click={() => iconsMenu = !iconsMenu} class="icon-container" class:active={iconsMenu}>
        <img src={$template.iconURL} style="width: 100%; height: 100%; border-radius: 50%;" alt="Task icon" />
      </button>
    {/if}

    <!-- on:input={(e) => debouncedRenameTask(e.target.value)} -->
    <input value={$template.name} type="text" placeholder="Untitled" style="width: 100%; font-size: 24px;" class="title-underline-input" />
  </div>

  {#await Template.getTotalStats({ id: $template.id })}
    <div class="stats">Loading stats...</div>
  {:then { minutesSpent, timesCompleted }}
    <div class="stats">
      Completed {timesCompleted} times, spent {formatTime(minutesSpent)}
    </div>
  {/await}
  
  {#if iconsMenu}
    <IconsDisplay />
  {/if}

  <!-- <EditTime /> -->

  <PeriodicityInputs 
    initialRRStr={$template.rrStr}
    on:update-rr={e => pendingRRStr = e.detail}
  />

  {#if pendingRRStr !== $template.rrStr}
    <div class="changes-section">
      <PreviewChanges {pendingRRStr} {addingTasks} {deletingTasks} {exceptions}/>

      <div class="action-button-container">
        <RoundButton on:click={handleSave} backgroundColor="rgb(0, 89, 125)" textColor="white">
          Apply changes
        </RoundButton>
      </div>
    </div>
  {/if}

  <button on:click|stopPropagation={handleDelete} class="material-symbols-outlined delete-button">
    delete
  </button>
</BasePopup>

<style>
  .title-underline-input { /* @see https://stackoverflow.com/a/3131082/7812829 */
    background: transparent;
    border: none;
    outline: none;
    font-size: 23px;
    font-weight: 700;
    padding-left: 0px;
  }

  .icon-container {
    width: 48px;
    height: 48px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-radius: 50%;
  }
  
  .icon-container.active {
    box-shadow: 0 2px 8px rgba(90, 179, 39, 0.5);
  }

  .changes-section {
    margin-top: 24px;
    width: 100%;
  }

  .action-button-container {
    display: flex;
    justify-content: flex-start;
    margin-top: 16px;
  }

  .delete-button {
    position: absolute;
    bottom: 16px;
    right: 16px;
    border-radius: 50%;
    padding: 4px;
  }

  .stats {
    color: #666;
    font-size: 12px;
    margin: 12px 0;
    line-height: 1.4;
  }
</style>