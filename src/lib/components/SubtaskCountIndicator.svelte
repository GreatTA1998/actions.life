<script>
  import MsCheckCircleOutline from 'virtual:icons/material-symbols/check-circle-outline'

  let { 
    task, 
    onclick = () => {},
    color = 'var(--task-name-color)',
    extraClass = '',
    fontSize = '1rem'
  } = $props()

  let subtasks = $derived(task.children)
</script>

<button {onclick} style:color
  class="flex items-center gap-x-[2px] {extraClass}" 
>
  <MsCheckCircleOutline style="font-size: calc(0.75 * {fontSize});" class="shrink-0"/>
  <span style="font-size: calc(0.75 * {fontSize}); text-box-trim: trim-both;" class="shrink-0 font-medium">
    {subtasks.filter(child => child.isDone).length}/{subtasks.length}
  </span>
</button>