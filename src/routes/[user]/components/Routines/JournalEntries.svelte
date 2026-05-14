<script>
  import { formatDate, round } from '$lib/utils/core.js'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'

  const { openTaskPopup } = getContext('task-popup')

  let { routineInstances = [] } = $props()

  let hasContent = $derived(routineInstances.filter(
    instance => !!(instance.notes?.trim() || instance.imageDownloadURL)
  ))

  function formatDuration (minutes) {
    if (!minutes) return ''

    const roundedMinutes = round(minutes, 0)
    const hours = Math.floor(roundedMinutes / 60)
    const remainingMins = roundedMinutes % 60

    if (hours === 0) return `${remainingMins} mins`
    
    if (remainingMins === 0) {
      return `${hours} hr${hours > 1 ? 's' : ''}`
    }
    return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMins} mins`
  }

  function formatTime (HHmm) {
    const dt = DateTime.fromFormat(HHmm, 'H:mm', { locale: 'en-US' })
    return dt.toFormat('h:mm a')
  }
</script>

<div class="p-4">
  <div class="flex w-full flex-col gap-[10px]">
    {#if hasContent.length === 0}
      <div class="px-4 py-[44px] text-center text-sm text-slate-500">
        No entries with notes or images yet
      </div>
    {:else}
      {#each hasContent as instance (instance.id)}
        <div
          class="flex gap-y-1 px-3 py-2 flex-col rounded-xl border border-solid border-[rgb(15_23_42_/_6%)] bg-[rgb(15_23_42_/_2.5%)]"
          onclick={() => openTaskPopup(instance)}
        >
          <div class="flex items-baseline justify-between gap-3">
            <div class="flex min-w-0 flex-wrap items-baseline gap-1.5 text-sm">
              <span class="font-semibold tracking-[-0.015em] text-slate-900">{formatDate(instance.startDateISO)}</span>
              {#if instance.startTime}
                <span class="font-normal text-slate-500">{formatTime(instance.startTime)}</span>
              {/if}
            </div>
            {#if instance.duration}
              <span class="shrink-0 text-xs font-medium tracking-[-0.01em] text-slate-500 tabular-nums">{formatDuration(instance.duration)}</span>
            {/if}
          </div>
          <div class="flex flex-col gap-2 text-sm leading-[1.45] text-slate-600">
            {#if instance.imageDownloadURL}
              <img
                src={instance.imageDownloadURL}
                class="h-auto max-h-[300px] w-fit self-start rounded-lg object-contain object-left-top"
              />
            {/if}
            <div class="break-words">{instance.notes}</div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
