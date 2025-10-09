<div 
  onclick={() => willTriggerFocus = true}
  class="ux-form-field"
  class:grey-border={!isFocused}
  class:blue-border={isFocused}
  style="height: fit-content;"
>
  <!-- <div class="ux-field-label">
    {fieldLabel}
  </div> -->

  <!-- input interface is a quick-fix, 
  
  and parent will need to consume `e.detail` instead of `e.target value` -->
  <div bind:this={InputElem}>
    <TextAreaAutoResizing
      {value}
      {willTriggerFocus}
      {oninput}
      onManuallyFocused={() => willTriggerFocus = false}
      onfocusin={() => isFocused = true}
      onfocusout={() => isFocused = false}
      {placeholder}
      resetDefaultStyling={true}
      numberOfInitialRowsIfEmpty={3}
    />
  </div>
</div>

<script>
  let { oninput, fieldLabel = '', placeholder, value = '' } = $props()

  import TextAreaAutoResizing from '$lib/components/TextAreaAutoResizing.svelte'
  
  let InputElem
  let willTriggerFocus = $state(false)
  let isFocused = $state(false)

</script>

<style>
  .blue-border {
    border: 0px solid #2757cf;
  }

  .grey-border {
    border: 0px solid #DBDBDD;
  }

  .ux-form-field {
    height: 100px;
    padding: 2px;
    /* padding-left: 9px;
    padding-right: 9px; */
    border-radius: 4px;
  }

  .ux-field-label {
    margin-top: 9px;
    margin-bottom: 8px;
    font-size: 14px;
    color: gray;
    font-family: 'Inter';
    line-height: 16px;
  }

  /* Don't touch these for now */
  .ux-input-text {
    margin-bottom: 9px;
    font-weight: 500;
    font-size: 24px;
    font-family: 'Inter';
    line-height: 18px;
  }

  /* remove default input styling */
  input {
    all: unset;
  }
</style>