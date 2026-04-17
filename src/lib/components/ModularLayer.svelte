<script>
  let { 
    zIndex = 3, 
    onClickOutside = () => {}, 
    children 
  } = $props()
</script>

<div 
  onclick={e => e.target === e.currentTarget && onClickOutside()}
  class="fixed w-screen h-screen top-0 left-0 bg-transparent" 
  style:z-index={zIndex}
> 
  {@render children()}
</div>