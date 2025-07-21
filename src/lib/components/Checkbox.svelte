<label style="zoom: {zoom}" on:click|stopPropagation class="container">
  <input type="checkbox" checked={value} on:change>
  <span class="checkmark"></span>
</label>

<script>
  export let value
  export let zoom = 0.6
</script>

<style>
  .container {
    display: block;
    position: relative;
    cursor: pointer;
    font-size: 30px;
    /* was 22px */
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    height: 25px;
    width: 25px;
  }

  /* Hide the browser's default checkbox */
  .container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  /* Create a custom checkbox */
  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 25px;
    width: 25px;
    background-color: transparent;
    border-radius: 15px;
    border: 2px solid var(--fine-control-color);
  }

  /* On mouse-over, add a grey background color */
  .container:hover input ~ .checkmark {
    background-color: #ccc;
  }

  /* When the checkbox is checked, add a blue background */
  .container input:checked ~ .checkmark {
    background-color: #509c13;
    /* blue:  #2196F3 */
    /* green: '#509c13' */
  }

  /* Create the checkmark/indicator (hidden when not checked) */
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  /* Show the checkmark when checked */
  .container input:checked ~ .checkmark:after {
    display: block;
  }

  /* Style the checkmark/indicator */
  .container .checkmark:after {
    left: 8px;
    top: 1px;
    width: 4px;
    height: 14px;
    border: solid white;
    border-width: 0 3px 3px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
</style>