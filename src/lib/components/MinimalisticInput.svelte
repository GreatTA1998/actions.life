<script>
  export let value
</script>

<div class="duration-input">
  <input 
    type="number" 
    pattern="[0-9]*"
    max="1000"
    min="0"
    placeholder="30"
    value={value}
    on:input
  >
  <span class="suffix">min</span>
</div>

<style>
  .duration-input {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  input {
    max-width: 80px;
    height: 30px;
    padding: 8px 40px 8px 12px; /* extra padding on right for "min" */
    border: 0px solid #e0e0e0;
    border-radius: 6px;
    outline: none;
    transition: border-color 0.2s;

    font-size: 14px;
    color: #808080;
  }

  input:focus {
    border-color: #007bff;
  }

  /* Remove spinner buttons */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type=number] {
    -moz-appearance: textfield;
  }

  .suffix {
    position: absolute;
    right: 12px;
    color: #666;
    font-size: 14px;
    pointer-events: none;
  }
</style>