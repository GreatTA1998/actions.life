<textarea 
  {value}
  {placeholder}
  {readonly}
  bind:this={element} 
  oninput={e => {
    auto_grow(element)
    oninput(e)
  }}
  {onfocusin}
  {onfocusout}
  rows={numberOfInitialRowsIfEmpty}
  style="
    width: 100%;
   --nonFocusedPlaceholderOpacity: {nonFocusedPlaceholderOpacity};
   --fontSizeIncludeUnits: {fontSizeIncludeUnits};
  "
  class:reset-default-styling={resetDefaultStyling}
></textarea>

<script>
  import { onMount } from 'svelte'

  let {
    oninput,
    onfocusin,
    onfocusout,
    onManuallyFocused = () => {},
    value = '',
    placeholder,
    readonly = false,
    nonFocusedPlaceholderOpacity = 0.6,
    numberOfInitialRowsIfEmpty = 1,
    fontSizeIncludeUnits = '1.4rem',
    resetDefaultStyling = false,
    willTriggerFocus
  } = $props()

  $effect(() => {
    if (willTriggerFocus) {
      element.focus()
      onManuallyFocused()
    }
  })

  onMount(() => {
    auto_grow(element)
  })

  let element
  function auto_grow(element) {
    element.style.height = "auto";
    element.style.height = (element.scrollHeight)+"px";
  }
</script>

<style>
  textarea {
    resize: none;
    overflow: hidden;
    min-height: 50px;
    font-size: var(--fontSizeIncludeUnits);
  }

  textarea::placeholder {
    opacity: var(--nonFocusedPlaceholderOpacity);
  }

  textarea:focus::placeholder{
    opacity: 0.6;
  }

  .reset-default-styling {
    all: unset;
  }
</style>