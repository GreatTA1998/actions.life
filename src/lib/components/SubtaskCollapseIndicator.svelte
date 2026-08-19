<script>
  import MsKeyboardArrowDown from 'virtual:icons/material-symbols/keyboard-arrow-down'
  import MsKeyboardArrowRight from 'virtual:icons/material-symbols/keyboard-arrow-right'
  import MslKeyboardArrowDown from 'virtual:icons/material-symbols-light/keyboard-arrow-down'
  import MslKeyboardArrowRight from 'virtual:icons/material-symbols-light/keyboard-arrow-right'

  const light = true
  const iconN = 1.5
  const nudge = 0.28 // em of the icon; eats viewBox padding without clipping

  let { 
    task, 
    onclick,
    color = 'var(--fine-control-color)', // 'var(--task-name-color)', // 'var(--fine-control-color)'
    extraClass = '',
    fontSize = '1rem'
  } = $props()

  let subtasks = $derived(task.children)
  let countStyle = $derived(`font-size: calc(0.75 * ${fontSize}); text-box-trim: trim-both;`)
  let Caret = $derived(
    light
      ? (task.isCollapsed ? MslKeyboardArrowRight : MslKeyboardArrowDown)
      : (task.isCollapsed ? MsKeyboardArrowRight : MsKeyboardArrowDown)
  )
</script>

<button {onclick} style:color
  class="flex items-center {extraClass} gap-x-[0px]" 
>
  <div
    style:font-size="calc({iconN} * {fontSize})"
    style:margin-inline="{-nudge}em"
    class="shrink-0 flex items-center"
  >
    <Caret/>
  </div>
  <span style={countStyle} class="shrink-0 font-normal">
    {subtasks.filter(child => child.isDone).length}/{subtasks.length}
  </span>
</button>
