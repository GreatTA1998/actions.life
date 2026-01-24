<script>
  import { getRandomID } from '$lib/utils/core.js'

  let { 
    children,
    listWidth,
    id = getRandomID(),
    inDialog = false
  } = $props()
</script>

<div style="
  view-transition-name: list-{id}; 
  view-transition-class: {inDialog ? 'dialog-list-item' : 'list-item'}; 
  width: {listWidth}px;"
>
  {@render children()}
</div>

