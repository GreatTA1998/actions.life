<script>
  // TO-DO: auto-focus (or at least, ability to type text without double clicking)
  import { onMount } from 'svelte'

  let { value, onenter, oninput, placeholder } = $props()
  let inputElem = $state(null)

  onMount(() => {
    inputElem.focus()
  })

  function onkeyup (e) {
    if (e.key === 'Enter') {
      onenter(e)
    }
  }
</script>

<input bind:this={inputElem}
  {placeholder}
  {value}
  {oninput}
  {onkeyup}
>