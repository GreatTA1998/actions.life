<script>
  import MslCheckCircleOutline from 'virtual:icons/material-symbols-light/check-circle-outline'
  let { 
    task, 
    onclick = () => {},
    color = '',
    extraClass = '',
    fontSize = '1rem'
  } = $props()

  let subtasks = $derived(task.children)
</script>

<button {onclick} 
  style:font-size={fontSize}
  class="flex items-center gap-x-[2px] {extraClass}" 
  style="color: {color}"
>
  <MslCheckCircleOutline style="font-size: 0.75em" class="shrink-0"/>
  <span style="font-size: 0.75em" class="shrink-0">
    {subtasks.filter(child => child.isDone).length}/{subtasks.length}
  </span>
</button>