<script>
  let { 
    children,
    listWidth,
    id
  } = $props()
</script>

<div style="view-transition-name: list-{id}; view-transition-class: list-item; width: {listWidth}px;">
  {@render children()}
</div>

