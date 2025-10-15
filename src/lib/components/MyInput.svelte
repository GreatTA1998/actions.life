<script>
  // Spec:
  //   - auto-focus (or at least, ability to type text without double clicking)
  //   - center aligned
  import { onMount } from 'svelte'

  let { value, onEnterPress, oninput, onfocusout, placeholder } = $props()
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

<div style="display: flex; justify-content: center;">
  <input bind:this={inputElem}
    {placeholder}
    {value}
    {oninput}
    {onkeyup}
    {onfocusout}
    class="my-input"
  >
</div>

<style>
  .my-input {
    width: var(--width-within-column);
    border-radius: var(--left-padding);
    padding-top: 0;
    padding-bottom: 0;
    font-size: 16px;
  }
</style>
