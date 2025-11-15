<script>
  // Spec:
  //   - auto-focus (or at least, ability to type text without double clicking)
  //   - self destroys if the user clicks outside of it
  import { onMount } from 'svelte'

  let { 
    value, 
    onEnterPress, 
    oninput, 
    onfocusout, 
    placeholder,
    fontSize = '16px',
    width = ''
  } = $props()
  
  let inputElem = $state(null)

  onMount(() => {
    inputElem.focus() // otherwise it's annoying to click twice just to enter text, must work across browsers
  })

  function onkeyup (e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.key === 'Enter') {
      onEnterPress(e)
    }
  }
</script>

<div style="display: flex; justify-content: center; height: 100%;">
  <input bind:this={inputElem}
    {placeholder}
    {value}
    {oninput}
    {onkeyup}
    {onfocusout}
    style="font-size: {fontSize}; width: {width}"
    class="my-input"
  >
</div>

<style>
  .my-input {
    border-radius: var(--left-padding);
    padding: 2px 4px;
  }
</style>
