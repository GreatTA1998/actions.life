<script>
  import { onMount, createEventDispatcher } from "svelte";

  export let fieldLabel = "Field Label";
  export let value = "";
  export let max = "";
  export let pattern = "";
  export let placeholder = "";
  export let willAutofocus = true;
  const dispatch = createEventDispatcher();

  function handleInput(event) {
    let newValue = event.target.value;
    if (pattern) {
      const regex = new RegExp(`^${pattern}$`);
      if (!regex.test(newValue)) {
        event.target.value = value;
        return;
      }
    }
    value = newValue;
    dispatch('input', { value: newValue });
  }

  let InputElem;
  let isFocused = false;

  onMount(() => {
    if (willAutofocus) {
      InputElem.focus();
    }
  });
</script>

<!-- Based on UX newsletter, includes
  - Infield top-aligned form labels

  More info: https://uxmovement.substack.com/p/8-rules-for-switching-to-infield
-->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="ux-form-field"
  on:click={() => InputElem.focus()}
  class:grey-border={!isFocused}
  class:blue-border={isFocused}
>
  <div class="ux-field-label">
    <slot name="icon"></slot>
    {fieldLabel}
  </div>

  <div style="display: flex; align-items: center;">
    <input
      {placeholder}
      {pattern}
      bind:this={InputElem}
      {value}
      {max}
      on:input={handleInput}
      on:keyup={(e) => {
        if (e.key === "Enter") {
          dispatch("task-entered", { taskName: value });
        }
      }}
      on:focusin={() => (isFocused = true)}
      on:focusout={() => {
        isFocused = false;
        dispatch("focus-out");
      }}
      class="ux-input-text"
    />

    <slot name="append"></slot>
  </div>
</div>

<style>
  .blue-border {
    border: 2px solid #2757cf;
  }

  .grey-border {
    border: 1px solid #dbdbdd;
  }

  .ux-form-field {
    height: 68px;
    padding: 10px;
    border-radius: 4px;
  }

  .ux-field-label {
    margin-bottom: 8px;
    font-size: 14px;
    color: gray;

    display: flex;
    align-items: center;
  }

  .ux-input-text {
    font-weight: 500;
    font-size: 16px;
    color: black;
    width: 100%;
  }


  .ux-input-text::placeholder {
    font-style: italic;
    color: #aaa;
    font-weight: 300;
  }

  /* remove default input styling */
  input {
    all: unset;

    /* 
      Prevents extremely strange bug where <input> is rendered WAY BELOW where it should be, 
      unexplainable by any hidden margins, inline styles, etc.

      vertical-align: baseline is the default value, setting it to `top` works around the bug,
      but I don't fully understand why.
      https://bard.google.com/chat/1219adb246100687 
    */
    vertical-align: top;
  }
</style>
