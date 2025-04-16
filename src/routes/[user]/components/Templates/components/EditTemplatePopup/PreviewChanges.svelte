<div class="preview-changes-container">
  <div class="dates-container">
    <div class="dates-column">
      {#if deletingTasks}
        {#each deletingTasks as task}   
          <div class="date-item deletion">
            <span class="icon">-</span>
            {formatDate(task.startDateISO)}
          </div>
        {/each}
      {/if}
    </div>

    <div class="dates-column">
      {#each addingTasks as occurence (occurence.toISOString())}
        <div class="date-item creation">
          <span class="icon">+</span>
          {formatDate(DateTime.fromJSDate(occurence).toFormat('yyyy-MM-dd'))}
        </div>
      {/each}
    </div>
  </div>

  <div>
    Generated until: {template.prevEndISO}, maintains a preview span of {template.previewSpan} days every time you log in
  </div>
</div>

<script>
  import { DateTime } from 'luxon'
  import { db } from '$lib/db/init.js'
  import { query, collection, where, getDocs } from 'firebase/firestore'
  import { user } from '$lib/store'
  import { getOccurrences } from '$lib/store/templateInstances.js'

  export let template
  export let pendingRRStr

  let deletingTasks = null
  let addingTasks = []

  $: onRRStrChange(pendingRRStr, template.rrStr) 

  function reset () {
    deletingTasks = null
    addingTasks = []
  }

  // there's a case where template.rrStr is undefined
  async function onRRStrChange () {
    if (pendingRRStr === template.rrStr) reset()
    else {
      deletingTasks = await getAffectedTasks()
      addingTasks = simulateChanges()  
    }
  }

  // Simple one-liner to determine periodicity
  const getPeriodicity = (rrStr) => rrStr?.toLowerCase().includes('freq=monthly') ? 'monthly' : rrStr?.toLowerCase().includes('freq=yearly') ? 'yearly' : 'weekly'

  function formatDate(dateStr) {
    const dt = DateTime.fromISO(dateStr)
    return dt.toFormat('yyyy MMM d ccc')
  }

  function simulateChanges () {
    if (!pendingRRStr) return []

    const copy = {...template}
    copy.rrStr = pendingRRStr
    if (getPeriodicity(pendingRRStr) === 'monthly') {
      copy.previewSpan = 2*31
    } else if (getPeriodicity(pendingRRStr) === 'yearly') {
      copy.previewSpan = 2*365
    } else {
      copy.previewSpan = 2*7
    }

    return getOccurrences({ 
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
    return tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}))
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

  .icon {
    font-weight: bold;
    margin-right: 6px;
    min-width: 8px;
  }
</style>