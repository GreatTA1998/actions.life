<script>
  import { placeholderField, paddingVal } from '$lib/styles/reused.module.css'

  let {
    oninput,
    value = '',
    placeholder,
    fontSize = '1rem',
    class: extraClass = ''
  } = $props()
</script>

<!-- style:field-sizing="content" -->
<textarea 
  {value}
  {oninput}
  {placeholder}
  class="w-full rounded {placeholderField} {extraClass}"
  style:padding="0 {paddingVal}"
  style:font-size={fontSize}
></textarea>