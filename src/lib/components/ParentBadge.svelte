<script>
  import { getContext } from 'svelte'

  let { parentObj } = $props()

  const { openTaskPopup } = getContext('task-popup')
</script>

<div 
  onclick={e => { 
    e.stopPropagation()
    openTaskPopup(parentObj)
  }} 
  class={[
    'font-medium shrink-0',
    'max-w-[12ch] whitespace-nowrap overflow-hidden'
  ]} 
  style="
    color: var(--color); 
    font-size: var(--font-size, 0.75rem);
    padding: var(--padding, 0px 4px);
    border: 1px solid rgba(150, 150, 150, 0.2);
    border-radius: var(--border-radius, 12px);
    background: var(--background, rgba(120, 120, 120, 0.15))
  "
>
  {parentObj.name.split(' ')[0]}
</div>