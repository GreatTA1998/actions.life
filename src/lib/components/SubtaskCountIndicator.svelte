<script>
  import MsCheckCircleOutline from 'virtual:icons/material-symbols/check-circle-outline'

  let {
    task,
    color = 'var(--task-name-color)',
    extraClass = '',
    fontSize = '1rem'
  } = $props()

  let done = $derived(task.children.filter(child => child.isDone).length)
</script>

<div style:color style:font-size={fontSize} class="flex items-center gap-x-[2px] {extraClass}">
  <div class="flex items-center justify-center min-h-0 h-[1lh]">
    <MsCheckCircleOutline class="size-[1em]"/>
  </div>
  <span style="font-size: 0.75em" class="shrink-0 font-medium">
    {done}/{task.children.length}
  </span>
</div>
