<script>
  let { 
    backgroundColor = 'rgb(0, 89, 125)',
    textColor = 'white',
    isBordered = false,
    disabled = false,
    onclick = () => {},
    children = null
  } = $props()
</script>

<button {onclick} {disabled}
  class="justify-center py-[10px] px-[18px] hover-glow"
  style:border-radius="24px"
  style:color={textColor}
  style:background-color={backgroundColor}
  style:border={isBordered ? '3px solid cyan' : ''}
>
  {@render children?.()}
</button>

<style>
  .hover-glow:hover {
    filter: brightness(105%);
  }
</style>
