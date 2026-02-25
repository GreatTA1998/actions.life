<script>
  import { getPreviewSpan } from '$lib/utils/rrule.js'
  import PreviewChangesItem from './PreviewChangesItem.svelte'

  let {
    addingTasks = [],
    deletingTasks = [],
    exceptions = [],
    pendingRRStr = ''
  } = $props()
</script>

<div class="grid gap-y-2">
  <div class="flex gap-x-4">
    <div class="flex flex-col gap-1">
      {#each addingTasks as task (task.startDateISO)}
        <PreviewChangesItem {task} type="creation" />
      {/each}
    </div>

    <div class="flex flex-col gap-1">
      {#each deletingTasks as task}   
        <PreviewChangesItem {task} type="deletion" />
      {/each}
    </div>

    <div class="flex flex-col gap-1">
      {#each exceptions as task}
        <PreviewChangesItem {task} type="unchanged" />
      {/each}
    </div>
  </div>

  <div class="text-sm">
    {getPreviewSpan({ rrStr: pendingRRStr })} day preview
  </div>
</div>