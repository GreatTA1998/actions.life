<textarea 
  {value}
  {oninput}
  {placeholder}
  class="w-full min-h-[48px] rounded {placeholderField}"
  style:field-sizing="content"
  style:font-size={fontSize}
></textarea>

<script>
  import { placeholderField } from '$lib/styles/reused.module.css'

  let {
    oninput,
    value = '',
    placeholder,
    fontSize = '1rem'
  } = $props()
</script>