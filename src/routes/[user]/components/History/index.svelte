<script>
  import { onMount, onDestroy } from 'svelte'
  import { DateTime } from 'luxon'
  import Task from '$lib/db/models/Task.js'
  import { user, updateCache, openTaskPopup } from '$lib/store/index.js'

  let tasks = $state([])
  let unsub = () => {}

  onMount(() => {
    unsub = Task.listenToCompleted($user.uid, (result) => {
      updateCache(result)
      tasks = result
    })
  })

  onDestroy(() => unsub())

  function sortKey (t) {
    if (typeof t.completedAt === 'number') return t.completedAt
    if (t.startDateISO) {
      const iso = t.startTime ? `${t.startDateISO}T${t.startTime}` : t.startDateISO
      const ms = Date.parse(iso)
      if (!isNaN(ms)) return ms
    }
    return 0
  }

  function bucketKey (t) {
    if (typeof t.completedAt === 'number') {
      return DateTime.fromMillis(t.completedAt).toFormat('yyyy-MM-dd')
    }
    if (t.startDateISO) return t.startDateISO
    return ''
  }

  let groups = $derived.by(() => {
    const sorted = [...tasks].sort((a, b) => sortKey(b) - sortKey(a))
    const byDay = new Map()
    for (const t of sorted) {
      const key = bucketKey(t)
      if (!byDay.has(key)) byDay.set(key, [])
      byDay.get(key).push(t)
    }
    return Array.from(byDay.entries())
  })

  function dayLabel (key) {
    if (!key) return 'Undated'
    const dt = DateTime.fromISO(key)
    if (!dt.isValid) return key
    const today = DateTime.now().startOf('day')
    const diff = today.diff(dt.startOf('day'), 'days').days
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return dt.toFormat('EEE, MMM d, yyyy')
  }
</script>

<div class="h-full basis-full flex flex-col relative">
  <div class="shrink-0 px-4 py-3 text-xl font-semibold">
    History
  </div>

  <div class="flex-1 overflow-y-auto px-4 pb-8">
    {#if tasks.length === 0}
      <div class="opacity-60 pt-8 text-center">
        No completed tasks yet.
      </div>
    {:else}
      {#each groups as [key, dayTasks] (key)}
        <div class="mt-4">
          <div class="sticky top-0 bg-white/80 backdrop-blur py-1 text-sm font-semibold opacity-80">
            {dayLabel(key)}
          </div>
          <div class="flex flex-col">
            {#each dayTasks as task (task.id)}
              <div
                onclick={() => openTaskPopup(task)}
                class="flex items-center gap-x-3 py-2 px-2 cursor-pointer hover:bg-black/5 rounded"
              >
                {#if task.imageDownloadURL}
                  <img src={task.imageDownloadURL}
                    class="w-10 h-10 object-cover rounded shrink-0"
                    loading="lazy"
                  />
                {:else}
                  <div class="w-3 h-3 shrink-0 rounded-full bg-green-600"></div>
                {/if}
                <div class="flex-1 min-w-0">
                  <div class="truncate">
                    {task.name || 'Untitled'}
                  </div>
                  {#if task.notes}
                    <div class="truncate text-sm opacity-60">
                      {task.notes}
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
