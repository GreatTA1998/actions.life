<script>
  let { value, onClick, label } = $props()
</script>

<label class="flex items-center gap-x-2">
  <input type="checkbox" 
    class="size-[16px] accent-stone-800" 
    checked={value}
    onclick={e => {
      e.stopPropagation();
      onClick();
    }}
  >
  <span class="text-sm">{label}</span>
</label>