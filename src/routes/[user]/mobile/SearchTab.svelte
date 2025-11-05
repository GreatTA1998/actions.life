<script>
  import { user, openTaskPopup, updateCache } from '$lib/store'
  import { collection, query, orderBy, limit, onSnapshot, getCountFromServer } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { DateTime } from 'luxon'
  import { onMount, onDestroy } from 'svelte'

  let allTasks = []
  let totalCount = 0
  let routines = []
  let keyword = ''
  let photosOnly = false
  let showArchived = false
  let recentlyScheduledArchived = false
  let activeInList = false
  let dateRange = 'all' // 'all', 'week', 'month', 'year'
  let sortBy = 'newest' // 'newest', 'oldest', 'alphabetical', 'largest-trees'
  let unsub
  let routinesUnsub

  async function fetchTotalCount() {
    try {
      const countQuery = query(collection(db, `users/${$user.uid}/tasks`))
      const countSnapshot = await getCountFromServer(countQuery)
      totalCount = countSnapshot.data().count
    } catch (err) {
      console.error('Error fetching total count:', err)
    }
  }

  onMount(() => {
    fetchTotalCount()
    const q = query(
      collection(db, `users/${$user.uid}/tasks`),
      orderBy('startDateISO', 'desc'),
      limit(100)
    )
    unsub = onSnapshot(q, snapshot => {
      allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      updateCache(allTasks)
    })

    routinesUnsub = onSnapshot(collection(db, `users/${$user.uid}/templates`), snapshot => {
      routines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    })
  })

  onDestroy(() => {
    if (unsub) unsub()
    if (routinesUnsub) routinesUnsub()
  })

  function buildTreeMap(tasks) {
    const map = new Map()
    tasks.forEach(t => map.set(t.id, { ...t, children: [] }))
    tasks.forEach(t => {
      if (t.parentID && map.has(t.parentID)) {
        map.get(t.parentID).children.push(map.get(t.id))
      }
    })
    return map
  }

  function getTreeSize(task, treeMap) {
    let size = 1
    const children = treeMap.get(task.id)?.children || []
    children.forEach(child => size += getTreeSize(child, treeMap))
    return size
  }

  $: filtered = allTasks.filter(task => {
    if (recentlyScheduledArchived) {
      if (!task.isArchived || !task.startDateISO) return false
    } else {
      if (!showArchived && task.isArchived) return false
    }
    
    if (activeInList) {
      if (!task.persistsOnList || task.isArchived) return false
    }
    
    if (keyword && !task.name.toLowerCase().includes(keyword.toLowerCase()) && 
        !task.notes?.toLowerCase().includes(keyword.toLowerCase()) &&
        !task.tags?.toLowerCase().includes(keyword.toLowerCase())) return false
    if (photosOnly && !task.imageDownloadURL) return false
    
    if (dateRange !== 'all' && task.startDateISO) {
      const taskDate = DateTime.fromISO(task.startDateISO)
      const now = DateTime.now()
      if (dateRange === 'week' && taskDate < now.startOf('week')) return false
      if (dateRange === 'month' && taskDate < now.startOf('month')) return false
      if (dateRange === 'year' && taskDate < now.startOf('year')) return false
    }
    
    return true
  })

  $: sorted = (() => {
    const copy = [...filtered]
    if (recentlyScheduledArchived) {
      return copy.sort((a, b) => (b.startDateISO || '').localeCompare(a.startDateISO || ''))
    }
    if (sortBy === 'newest') {
      return copy.sort((a, b) => (b.startDateISO || '').localeCompare(a.startDateISO || ''))
    }
    if (sortBy === 'oldest') {
      return copy.sort((a, b) => (a.startDateISO || '').localeCompare(b.startDateISO || ''))
    }
    if (sortBy === 'alphabetical') {
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    }
    if (sortBy === 'largest-trees') {
      const treeMap = buildTreeMap(filtered)
      return copy.sort((a, b) => {
        const aRootID = a.rootID || a.id
        const bRootID = b.rootID || b.id
        const aRoot = treeMap.get(aRootID) || a
        const bRoot = treeMap.get(bRootID) || b
        return getTreeSize(bRoot, treeMap) - getTreeSize(aRoot, treeMap)
      })
    }
    return copy
  })()

  $: results = sorted.slice(0, 50)

  $: activeListCandidates = allTasks.filter(task => task.persistsOnList && !task.isArchived)

  $: firestoreQueryDebug = {
    collection: `users/${$user.uid}/tasks`,
    orderBy: [{ field: 'startDateISO', direction: 'desc' }],
    limit: 100,
    where: []
  }

  function appliedLabel(enabled) {
    return enabled ? 'client (post-fetch)' : 'inactive'
  }

  $: debugFilters = [
    {
      label: 'Photos',
      enabled: photosOnly,
      firestoreWhere: "where('imageDownloadURL', '!=', '')",
      applied: appliedLabel(photosOnly)
    },
    {
      label: 'Archived',
      enabled: showArchived,
      firestoreWhere: "where('isArchived', '==', true)",
      applied: appliedLabel(showArchived)
    },
    {
      label: 'Recently scheduled archived',
      enabled: recentlyScheduledArchived,
      firestoreWhere: "where('isArchived', '==', true) & where('startDateISO', '!=', null)",
      applied: appliedLabel(recentlyScheduledArchived)
    },
    {
      label: 'Active in list',
      enabled: activeInList,
      firestoreWhere: "where('persistsOnList', '==', true) & where('isArchived', '==', false)",
      applied: appliedLabel(activeInList)
    },
    {
      label: 'Date range',
      enabled: dateRange !== 'all',
      firestoreWhere: "where('startDateISO', '>=', rangeStart) & where('startDateISO', '<=', rangeEnd)",
      applied: dateRange !== 'all' ? 'client (post-fetch)' : 'inactive'
    },
    {
      label: 'Keyword',
      enabled: !!keyword.trim(),
      firestoreWhere: 'N/A (requires text search)',
      applied: keyword.trim() ? 'client (post-fetch)' : 'inactive'
    }
  ]

  $: debugMetrics = {
    totalCount,
    fetchedCount: allTasks.length,
    filteredCount: filtered.length,
    resultsCount: results.length,
    activeListCandidates: activeListCandidates.length,
    filters: {
      keyword,
      photosOnly,
      showArchived,
      recentlyScheduledArchived,
      activeInList,
      dateRange,
      sortBy
    },
    firestoreWhereActive: debugFilters
      .filter(filter => filter.enabled && filter.firestoreWhere && filter.firestoreWhere !== 'N/A (requires text search)')
      .map(filter => filter.firestoreWhere)
  }

  $: console.log('SearchTab filters', debugMetrics)
  $: console.log('SearchTab Firestore query', { firestoreQueryDebug, debugFilters })

  function formatDisplayDate(iso) {
    if (!iso) return ''
    const dt = DateTime.fromISO(iso)
    return dt.isValid ? dt.toLocaleString(DateTime.DATE_MED) : ''
  }

  function openRoutineResult(result) {
    if (!result?.instances?.length) return
    openTaskPopup(result.instances[0])
  }

  $: routineResults = (() => {
    if (!routines?.length) return []

    const trimmedKeyword = keyword.trim().toLowerCase()
    const routineInstances = filtered.filter(task => task.templateID)
    const grouped = new Map()

    routineInstances.forEach(instance => {
      const templateID = instance.templateID
      if (!grouped.has(templateID)) {
        grouped.set(templateID, [])
      }
      grouped.get(templateID).push(instance)
    })

    const results = []

    grouped.forEach((instances, templateID) => {
      const routine = routines.find(r => r.id === templateID)
      if (!routine) return
      results.push({ id: templateID, routine, instances })
    })

    if (trimmedKeyword) {
      routines.forEach(routine => {
        const haystack = `${routine.name || ''} ${routine.notes || ''} ${routine.tags || ''}`.toLowerCase()
        if (haystack.includes(trimmedKeyword) && !results.some(r => r.id === routine.id)) {
          results.push({ id: routine.id, routine, instances: [] })
        }
      })
    }

    return results
      .sort((a, b) => {
        const aCount = a.instances.length
        const bCount = b.instances.length
        if (aCount !== bCount) return bCount - aCount
        return (a.routine.name || '').localeCompare(b.routine.name || '')
      })
      .slice(0, 12)
  })

  const todayISO = DateTime.now().toISODate()

  function formatTaskTime(task) {
    if (!task?.startDateISO || !task?.startTime) return ''

    try {
      return DateTime.fromISO(`${task.startDateISO}T${task.startTime}`).toFormat('h:mm a')
    } catch (err) {
      console.warn('Unable to format start time for task', task?.id, err)
      return task.startTime
    }
  }

  function hasMeta(task) {
    return Boolean(task?.imageDownloadURL || task?.isArchived || !task?.startDateISO)
  }

  function groupByDate(tasks = []) {
    const groups = []
    const map = new Map()

    for (const task of tasks) {
      const key = task.startDateISO || 'unscheduled'

      if (!map.has(key)) {
        let dateTime = null
        if (task.startDateISO) {
          const dtCandidate = DateTime.fromISO(task.startDateISO)
          dateTime = dtCandidate.isValid ? dtCandidate : null
        }
        map.set(key, {
          key,
          dateISO: task.startDateISO || null,
          dateTime,
          iconTasks: [],
          timedTasks: [],
          flexibleTasks: [],
          total: 0
        })
        groups.push(map.get(key))
      }

      const group = map.get(key)
      group.total += 1

      if (task.startDateISO && task.startTime) {
        group.timedTasks.push(task)
      } else if (task.iconURL) {
        group.iconTasks.push(task)
      } else {
        group.flexibleTasks.push(task)
      }
    }

    return groups
  }

  $: groupedResults = groupByDate(results)
</script>

<div class="search-tab">
  <input 
    type="text" 
    placeholder="Search tasks..."
    bind:value={keyword}
    class="search-input"
  />

  <div class="filters">
    <label><input type="checkbox" bind:checked={photosOnly} /> Photos</label>
    <label><input type="checkbox" bind:checked={showArchived} /> Archived</label>
    <label><input type="checkbox" bind:checked={recentlyScheduledArchived} /> Recently scheduled archived</label>
    <label><input type="checkbox" bind:checked={activeInList} /> Active in list</label>
    <select bind:value={dateRange}>
      <option value="all">All time</option>
      <option value="week">This week</option>
      <option value="month">This month</option>
      <option value="year">This year</option>
    </select>
    <select bind:value={sortBy}>
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
      <option value="alphabetical">A-Z</option>
      <option value="largest-trees">Largest trees</option>
    </select>
  </div>

  <details class="debug-panel">
    <summary>Debug filters</summary>
    <div class="debug-section">
      <h4>Summary</h4>
      <pre>{JSON.stringify(debugMetrics, null, 2)}</pre>
    </div>
    <div class="debug-section">
      <h4>Firestore query</h4>
      <pre>{JSON.stringify(firestoreQueryDebug, null, 2)}</pre>
    </div>
    <div class="debug-section">
      <h4>Filter mapping</h4>
      <ul class="debug-filter-list">
        {#each debugFilters as filter (filter.label)}
          <li>
            <span class="filter-name">{filter.label}</span>
            <span class="filter-status">enabled: {filter.enabled ? 'yes' : 'no'}</span>
            <span class="filter-where">firestore: {filter.firestoreWhere}</span>
            <span class="filter-applied">applied: {filter.applied}</span>
          </li>
        {/each}
      </ul>
    </div>
  </details>

  <div class="results-count">{filtered.length} of {totalCount} tasks</div>

  <div class="results">
    {#if routineResults.length}
      <div class="routine-strip-container">
        <span class="routine-strip-title">Routines</span>
        <div class="routine-strip">
          {#each routineResults as routineResult (routineResult.id)}
            <button
              class="routine-chip"
              class:inactive={!routineResult.instances.length}
              onclick={() => openRoutineResult(routineResult)}
              disabled={!routineResult.instances.length}
            >
              <div class="chip-avatar">
                {#if routineResult.routine.iconURL}
                  <img src={routineResult.routine.iconURL} alt="" />
                {:else}
                  <span>{(routineResult.routine.name || 'R')[0]}</span>
                {/if}
                {#if routineResult.routine.isStarred}
                  <span class="material-symbols-outlined chip-star">star</span>
                {/if}
              </div>
              <div class="chip-body">
                <span class="chip-name">{routineResult.routine.name || 'Untitled routine'}</span>
                {#if routineResult.instances.length}
                  <span class="chip-meta">{routineResult.instances.length} match{routineResult.instances.length === 1 ? '' : 'es'} · Last {formatDisplayDate(routineResult.instances[0].startDateISO)}</span>
                {:else if keyword.trim()}
                  <span class="chip-meta muted">No matching instances</span>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      </div>
      <div class="results-divider"></div>
    {/if}

    {#if groupedResults.length}
      {#each groupedResults as group (group.key)}
        <section class="result-group">
          <header class="group-header">
            <div class="date-chip">
              {#if group.dateTime}
                <span class="weekday">{group.dateTime.toFormat('ccc')}</span>
                <span class:today={group.dateISO === todayISO} class="day-number">{group.dateTime.toFormat('d')}</span>
                <span class="month-year">{group.dateTime.toFormat('LLL yyyy')}</span>
              {:else if group.dateISO}
                <span class="month-year">{group.dateISO}</span>
              {:else}
                <span class="month-year">No date</span>
              {/if}
            </div>
            <span class="group-count">{group.total} {group.total === 1 ? 'task' : 'tasks'}</span>
          </header>

          {#if group.iconTasks.length}
            <div class="icon-section">
              {#each group.iconTasks as task (task.id)}
                <div
                  class="task-row icon"
                  class:completed={task.isDone}
                  role="button"
                  tabindex="0"
                  onclick={() => openTaskPopup(task)}
                  onkeydown={(e) => e.key === 'Enter' && openTaskPopup(task)}
                >
                  <img src={task.iconURL} alt={task.name} />
                  <div class="task-text">
                    <div class="name" class:done={task.isDone}>{task.name}</div>
                    {#if hasMeta(task)}
                      <div class="task-meta">
                        {#if task.imageDownloadURL}
                          <span class="material-symbols-outlined info-icon">photo</span>
                        {/if}
                        {#if task.isArchived}
                          <span class="meta-flag">Archived</span>
                        {/if}
                        {#if !task.startDateISO}
                          <span class="meta-flag muted">No date</span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}

          {#if group.timedTasks.length}
            <div class="timed-section">
              {#each group.timedTasks as task (task.id)}
                <div
                  class="task-row timed"
                  class:completed={task.isDone}
                  role="button"
                  tabindex="0"
                  onclick={() => openTaskPopup(task)}
                  onkeydown={(e) => e.key === 'Enter' && openTaskPopup(task)}
                >
                  <span class="time">{formatTaskTime(task)}</span>
                  <div class="task-text">
                    <div class="name" class:done={task.isDone}>{task.name}</div>
                    {#if hasMeta(task)}
                      <div class="task-meta">
                        {#if task.imageDownloadURL}
                          <span class="material-symbols-outlined info-icon">photo</span>
                        {/if}
                        {#if task.isArchived}
                          <span class="meta-flag">Archived</span>
                        {/if}
                        {#if !task.startDateISO}
                          <span class="meta-flag muted">No date</span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}

          {#if group.flexibleTasks.length}
            <div class="flexible-section">
              {#each group.flexibleTasks as task (task.id)}
                <div
                  class="task-row flexible"
                  class:completed={task.isDone}
                  role="button"
                  tabindex="0"
                  onclick={() => openTaskPopup(task)}
                  onkeydown={(e) => e.key === 'Enter' && openTaskPopup(task)}
                >
                  <span class="bullet" class:done={task.isDone} aria-hidden="true"></span>
                  <div class="task-text">
                    <div class="name" class:done={task.isDone}>{task.name}</div>
                    {#if hasMeta(task)}
                      <div class="task-meta">
                        {#if task.imageDownloadURL}
                          <span class="material-symbols-outlined info-icon">photo</span>
                        {/if}
                        {#if task.isArchived}
                          <span class="meta-flag">Archived</span>
                        {/if}
                        {#if !task.startDateISO}
                          <span class="meta-flag muted">No date</span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </section>
      {/each}
    {:else}
      <div class="no-results">No tasks match these filters yet.</div>
    {/if}
  </div>
</div>

<style>
  .search-tab {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .search-input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
  }

  .filters {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }

  .filters label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
  }

  .filters select {
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  .results-count {
    font-size: 12px;
    color: #666;
  }

  .results {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .debug-panel {
    font-size: 12px;
    background: #f9f9f9;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 8px 12px;
  }

  .debug-panel summary {
    font-weight: 500;
    cursor: pointer;
  }

  .debug-panel pre {
    margin: 8px 0 0;
    padding: 8px;
    background: #ffffff;
    border: 1px solid #ededed;
    border-radius: 6px;
    font-family: ui-monospace, SFMono-Regular, SFMono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .debug-section + .debug-section {
    margin-top: 12px;
  }

  .debug-section h4 {
    margin: 8px 0;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #555;
  }

  .debug-filter-list {
    list-style: none;
    padding: 0;
    margin: 8px 0 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .debug-filter-list li {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 6px 8px;
    border: 1px dashed #dcdcdc;
    border-radius: 6px;
    background: #fff;
  }

  .debug-filter-list .filter-name {
    font-weight: 600;
    color: #333;
  }

  .debug-filter-list .filter-status,
  .debug-filter-list .filter-where,
  .debug-filter-list .filter-applied {
    color: #555;
  }

  .results-divider {
    height: 1px;
    background: #e8e8e8;
    margin: 6px 0 0;
  }

  .routine-strip-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 4px;
  }

  .routine-strip-title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: #555;
  }

  .routine-strip {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .routine-strip::-webkit-scrollbar {
    height: 4px;
  }

  .routine-strip::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 999px;
  }

  .routine-chip {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border: 1px solid #e1e1e1;
    background: white;
    border-radius: 999px;
    padding: 6px 12px 6px 6px;
    min-width: 0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .routine-chip:hover:not(:disabled) {
    border-color: #c8c8c8;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  }

  .routine-chip:disabled,
  .routine-chip.inactive {
    cursor: default;
    opacity: 0.6;
    box-shadow: none;
  }

  .chip-avatar {
    position: relative;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    background: #f3f3f3;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #555;
  }

  .chip-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .chip-star {
    position: absolute;
    top: -4px;
    right: -4px;
    font-size: 16px;
    color: #f5b400;
    background: white;
    border-radius: 50%;
    padding: 1px;
  }

  .chip-body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
  }

  .chip-name {
    font-weight: 500;
    font-size: 14px;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chip-meta {
    font-size: 11px;
    color: #666;
    white-space: nowrap;
  }

  .chip-meta.muted {
    color: #999;
  }

  .result-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 0 4px;
    border-bottom: 1px solid #ececec;
  }

  .result-group:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .date-chip {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 13px;
    color: #555;
  }

  .date-chip .weekday {
    font-weight: 600;
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #777;
  }

  .date-chip .day-number {
    font-size: 18px;
    font-weight: 600;
    color: #202020;
  }

  .date-chip .day-number.today {
    color: var(--location-indicator-color, #00597d);
  }

  .date-chip .month-year {
    font-size: 12px;
    color: #777;
  }

  .group-count {
    font-size: 12px;
    color: #888;
    white-space: nowrap;
  }

  .icon-section,
  .timed-section,
  .flexible-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .task-row {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    column-gap: 8px;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .task-row:hover {
    border-color: #e0e0e0;
    background: #f7f7f7;
  }

  .task-row:focus-visible {
    outline: 2px solid var(--location-indicator-color, #00597d);
    outline-offset: 2px;
  }

  .task-row.completed {
    opacity: 0.75;
  }

  .task-row.completed:hover {
    opacity: 1;
  }

  .task-row .task-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .task-row .name {
    font-weight: 500;
    font-size: 14px;
    color: #2f2f2f;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .task-row .name.done {
    color: #8a8a8a;
    text-decoration: line-through;
  }

  .task-row .task-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #777;
  }

  .task-row .info-icon {
    font-size: 16px;
  }

  .task-row.timed .time {
    font-size: 12px;
    font-weight: 600;
    color: var(--location-indicator-color, #00597d);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .task-row.icon img {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid #e4e4e4;
  }

  .task-row.flexible .bullet {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--location-indicator-color, #00597d);
    display: inline-block;
  }

  .task-row.flexible .bullet.done {
    background: #c5c5c5;
  }

  .meta-flag {
    padding: 1px 6px;
    border-radius: 999px;
    background: #efefef;
    font-size: 11px;
    font-weight: 500;
    color: #555;
    text-transform: capitalize;
  }

  .meta-flag.muted {
    background: transparent;
    color: #999;
  }

  .no-results {
    padding: 16px;
    font-size: 13px;
    color: #777;
    text-align: center;
  }
</style>

