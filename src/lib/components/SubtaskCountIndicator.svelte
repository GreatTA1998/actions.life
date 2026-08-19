<script>
  import MsCheckCircleOutline from 'virtual:icons/material-symbols/check-circle-outline'

  let { 
    task, 
    color = 'var(--task-name-color)',
    extraClass = '',
    fontSize = '1rem'
  } = $props()

  let subtasks = $derived(task.children)
  let countStyle = $derived(`font-size: calc(0.75 * ${fontSize}); text-box-trim: trim-both;`)
  let checkStyle = $derived(`font-size: calc(0.75 * ${fontSize});`)
</script>

<div style:color
  class="flex items-center gap-x-[2px] {extraClass}" 
>
  <MsCheckCircleOutline style={checkStyle} class="shrink-0"/>
  <span style={countStyle} class="shrink-0 font-medium">
    {subtasks.filter(child => child.isDone).length}/{subtasks.length}
  </span>
</div>
