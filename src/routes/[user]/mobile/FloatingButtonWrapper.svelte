<script>
  export let distanceFromBottom = 16
  export let backgroundColor = ''

  function setBackgroundColor (newVal) {
    backgroundColor = newVal
  }
</script>

<div on:click on:keydown 
  class="floating-button"
  style="--distance-from-bottom: {distanceFromBottom}px; background-color: {backgroundColor};"
>
  <slot {setBackgroundColor}>
    
  </slot>
</div>

<style>
  .floating-button {
    position: absolute;
    right: 16px;
    bottom: var(--distance-from-bottom);

    border: 4px solid black;
    height: 72px;
    width: 72px;
    border-radius: 36px;

    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>