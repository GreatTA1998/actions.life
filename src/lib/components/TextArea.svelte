<textarea 
  {value}
  {oninput}
  {placeholder}
  class="w-full min-h-[48px] rounded {placeholderField}"
  style:padding="0 {paddingVal}"
  style:field-sizing="content"
  style:font-size={fontSize}
></textarea>

<script>
  import { placeholderField, paddingVal } from '$lib/styles/reused.module.css'

  let {
    oninput,
    value = '',
    placeholder,
    fontSize = '1rem'
  } = $props()
</script>