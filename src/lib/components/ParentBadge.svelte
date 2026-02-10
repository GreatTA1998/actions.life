<script>
  import { getContext } from 'svelte'

  let { parent } = $props()
  const { openTaskPopup } = getContext('app')
</script>

<div 
  onclick={e => { 
    e.stopPropagation()
    openTaskPopup(parent)
  }} 
  class="glass-pill content-sized" 
  style="
    color: var(--color); 
    font-size: var(--font-size, 0.75rem);
    padding: var(--padding, 0px 4px);
    border-radius: var(--border-radius, 12px);
    background: var(--background, rgba(120, 120, 120, 0.15))
  "
>
  {parent.name.split(' ')[0]}
</div>

<style>
  .glass-pill {
    border: 1px solid rgba(150, 150, 150, 0.2);
    font-weight: 500;
    cursor: pointer;
  }

  .content-sized {
    flex: 0 0 auto;
    max-width: 12ch;
    white-space: nowrap; overflow: hidden; text-overflow: clip;
  }
</style>