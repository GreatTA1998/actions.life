<script>
  import { DateTime } from 'luxon'

  let { 
    task, 
    type = 'unchanged' 
  } = $props()

  function formatDate(dateStr) {
    const dt = DateTime.fromISO(dateStr)
    return dt.toFormat('MMM d ccc')
  }

  const typeClasses = {
    creation: 'text-[#36a76b]',
    deletion: 'text-[#e53e3e]',
    unchanged: 'text-[darkblue]'
  }
</script>

<div
  class="relative px-2 py-1 overflow-hidden rounded {typeClasses[type]}"
  style={task.imageDownloadURL ? `background-image: url(${task.imageDownloadURL}); 
    background-size: cover; 
    background-position: center; 
    background-blend-mode: lighten;
  `
    : ''
  }
>
  <div class="absolute inset-0 bg-white/65 z-[1]"></div>
  <div class="relative z-[2]">
    <div class="flex items-center text-xs gap-x-1">
      <span class="min-w-[8px]">
        {#if type === 'creation'}
          +
        {:else if type === 'deletion'}
          -
        {:else if type === 'unchanged'}
          =
        {/if}
      </span>
      <span class="font-medium">
        {formatDate(task.startDateISO)}
      </span>
      {#if task.duration}
        <span class="ml-auto font-light">{task.duration}m</span>
      {/if}
    </div>

    <div class="max-w-[20ch] truncate text-xs">
      {task.notes}
    </div>
  </div>
</div>