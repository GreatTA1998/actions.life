<!-- 
  Note, the HTML checkbox tick color literally cannot be changed, 
  but it will be automatically white if it "decides" that our chosen background color is dark enough, and vice versa
 -->
<label style:font-size={fontSize} onclick={e => { e.stopPropagation(); onclick(); }} class="container">
  <!-- 
    `checked` only hydrates the initial value 
    use `e.target.checked`
  -->
  <input type="checkbox" checked={value} {onchange}>
  <span class="checkmark"></span>
</label>

<script>
  let { 
    onclick = () => {}, 
    onchange, 
    value, 
    fontSize = '0.875rem'
  } = $props()
</script>

<style>
  .container {
    display: block;
    position: relative;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    height: 1em;
    width: 1em;
  }

  /* Hide the browser's default checkbox */
  .container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 1em;
    width: 1em;
    background-color: transparent;
    border-radius: 0.6em;
    border: 0.08em solid var(--fine-control-color);
  }

  .container input:checked ~ .checkmark {
    background-color: #509c13;
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
    left: 0.32em;
    top: 0.04em;
    width: 0.16em;
    height: 0.56em;
    border: solid white;
    border-width: 0 0.12em 0.12em 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
</style>