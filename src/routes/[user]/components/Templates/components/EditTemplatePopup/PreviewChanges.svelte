<div class="preview-changes-container">
  <div class="dates-container">
    <div class="dates-column">
      {#if tasks}
        {#each tasks as task}   
          <div class="date-item deletion">
            <span class="minus">-</span>
            {formatDate(task.startDateISO)}
          </div>
        {/each}
      {/if}
    </div>

    <div class="dates-column">
      {#each simulatedResult as occurence (occurence.toISOString())}
        <div class="date-item creation">
          <span class="plus">+</span>
          {formatDate(DateTime.fromJSDate(occurence).toFormat('yyyy-MM-dd'))}
        </div>
      {/each}
    </div>
  </div>

  <div>
    Previously generated until: {template.prevEndISO}
  </div>
</div>

<script>
  import { DateTime } from 'luxon'
  import { db } from '$lib/db/init.js'
  import { query, collection, where, getDocs } from 'firebase/firestore'
  import { user } from '$lib/store'
  import { onMount } from 'svelte'
  import { getOccurrences } from '$lib/store/templateInstances.js'

  export let template
  export let pendingRRStr

  let tasks = null
  let simulatedResult = []

  $: onRRStrChange(pendingRRStr) 

  function reset () {
    console.log('reset')
    tasks = null
    simulatedResult = []
  }

  // there's a case where template.rrStr is undefined
  async function onRRStrChange () {
    if (!pendingRRStr || pendingRRStr === template.rrStr) reset()
    else {
      tasks = await getAffectedTasks()
      simulateChanges()  
    }
  }

  // Simple one-liner to determine periodicity
  const getPeriodicity = (rrStr) => rrStr?.toLowerCase().includes('freq=monthly') ? 'monthly' : rrStr?.toLowerCase().includes('freq=yearly') ? 'yearly' : 'weekly'

  function formatDate(dateStr) {
    const dt = DateTime.fromISO(dateStr)
    return dt.toFormat('yyyy MMM d ccc')
  }

  function simulateChanges () {
    const copy = {...template}
    copy.rrStr = pendingRRStr
    if (getPeriodicity(pendingRRStr) === 'monthly') {
      copy.previewSpan = 2*31
    } else if (getPeriodicity(pendingRRStr) === 'yearly') {
      copy.previewSpan = 2*365
    } else {
      copy.previewSpan = 2*7
    }

    simulatedResult = getOccurrences({ 
      template: copy, 
      startISO: DateTime.now().toFormat('yyyy-MM-dd'), 
      uid: $user.uid 
    })
  }

  async function getAffectedTasks () {
    const tasksQuery = query(
      collection(db, 'users', $user.uid, 'tasks'),
      where('templateID', '==', template.id),
      where('startDateISO', '>=', DateTime.now().toFormat('yyyy-MM-dd'))
    )
    const tasksSnapshot = await getDocs(tasksQuery)
    return tasksSnapshot.docs.map(doc => doc.data())
  }
</script>

<style>
  .preview-changes-container {
    margin-top: 16px;
    width: fit-content;
  }

  .dates-container {
    display: flex;
    gap: 16px;
  }

  .dates-column {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .date-item {
    font-size: 12px;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  .deletion {
    color: #e53e3e;
  }

  .creation {
    color: #36a76b;
  }

  .minus {
    font-weight: bold;
    margin-right: 6px;
    min-width: 8px;
  }

  .plus {
    font-weight: bold;
    margin-right: 6px;
    min-width: 8px;
  }
</style>