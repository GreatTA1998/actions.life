<script>
  // TO-DO: 
  //   - auto-focus (or at least, ability to type text without double clicking)
  //   - aligned properly
  import { onMount } from 'svelte'

  let { value, onenter, oninput, placeholder } = $props()
  let inputElem = $state(null)

  onMount(() => {
    inputElem.focus() // otherwise it's annoying to click twice just to enter text, must work across browsers
  })

  function onkeyup (e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.key === 'Enter') {
      onenter(e)
    }
  }
</script>

<div style="outline: 2px solid red">
  <input bind:this={inputElem}
    {placeholder}
    {value}
    {oninput}
    {onkeyup}
  >
</div>
