<script>
  import MslKeyboardArrowDown from 'virtual:icons/material-symbols-light/keyboard-arrow-down'
  import MslKeyboardArrowRight from 'virtual:icons/material-symbols-light/keyboard-arrow-right'

  let {
    task,
    color = 'var(--task-name-color)',
    extraClass = '',
    fontSize = '1rem',
    collapsed = false,
    onclick
  } = $props()

  let done = $derived(task.children.filter(child => child.isDone).length)
  let Icon = $derived(collapsed ? MslKeyboardArrowRight : MslKeyboardArrowDown)
</script>

<button {onclick} style:color style:font-size={fontSize} class="flex items-center {extraClass}">
  <div class="flex items-center justify-center w-[1em] h-[1em]">
    <Icon class="size-[1.75em] shrink-0" />
  </div>
  <span style="font-size: 0.75em" class="shrink-0 font-normal">
    {done}/{task.children.length}
  </span>
</button>
