<script>
  let { value, onchange } = $props()

</script>

<input type="color" {value} {onchange}>

<style>
  input[type="color"] {
    -webkit-appearance: none; /* Required for Chrome/Safari */
    appearance: none;
    width: 24px; /* let height auto:preserve aspect ratio */
    background-color: transparent;
    border: none;
    cursor: pointer;
  }

  /* Chrome, Safari, Edge */
  input[type="color"]::-webkit-color-swatch {
    border-radius: 50%; /* Make it a circle */
    border: 2px solid #ccc;
  }

  /* Firefox */
  input[type="color"]::-moz-color-swatch {
    border-radius: 50%;
    border: 2px solid #ccc;
  }
</style>