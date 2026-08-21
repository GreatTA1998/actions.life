<script>
  let { 
    checked = false, 
    label = '',
    onchange = () => {}
  } = $props()
</script>

<label class="relative inline-flex items-center cursor-pointer h-8 [-webkit-tap-highlight-color:transparent]">
  <input type="checkbox" {checked} {onchange} class="peer opacity-0 w-0 h-0 m-0">
  <span
    class="relative inline-block w-9 h-5 bg-[#e0e0e0] rounded-[20px] transition-[background-color] duration-200 ease
      before:content-[''] before:absolute before:h-4 before:w-4 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-transform before:duration-200 before:ease before:shadow-[0_1px_3px_rgba(0,0,0,0.2)]
      peer-checked:bg-[#1a73e8] peer-checked:before:translate-x-4"
  ></span>
  <span class="ml-2 text-[#70757a] leading-none text-md">{label}</span>
</label>
