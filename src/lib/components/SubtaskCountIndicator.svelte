<script>
  import MsCheckCircleOutline from 'virtual:icons/material-symbols/check-circle-outline'
  import MslKeyboardArrowDown from 'virtual:icons/material-symbols-light/keyboard-arrow-down'
  import MslKeyboardArrowRight from 'virtual:icons/material-symbols-light/keyboard-arrow-right'

  let { 
    task, 
    color = 'var(--task-name-color)',
    extraClass = '',
    fontSize = '1rem',
    collapsed = undefined,
    onclick
  } = $props()

  let done = $derived(task.children.filter(child => child.isDone).length)
  let countStyle = $derived(`font-size: calc(0.75 * ${fontSize}); text-box-trim: trim-both;`)
  let collapsible = $derived(collapsed !== undefined)
  let Icon = $derived(
    collapsible
      ? (collapsed ? MslKeyboardArrowRight : MslKeyboardArrowDown)
      : MsCheckCircleOutline
  )
</script>

{#snippet body()}
  <div
    class="shrink-0 flex items-center"
    style:font-size="calc({collapsible ? 1.5 : 0.75} * {fontSize})"
    style:margin-inline={collapsible ? '-0.28em' : undefined}
  >
    <Icon class="shrink-0"/>
  </div>
  <span style={countStyle} class="shrink-0 {collapsible ? 'font-normal' : 'font-medium'}">
    {done}/{task.children.length}
  </span>
{/snippet}

{#if collapsible}
  <button {onclick} style:color class="flex items-center gap-x-[0px] {extraClass}">
    {@render body()}
  </button>
{:else}
  <div style:color class="flex items-center gap-x-[2px] {extraClass}">
    {@render body()}
  </div>
{/if}
