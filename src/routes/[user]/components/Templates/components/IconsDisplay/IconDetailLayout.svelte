<script>
  let { children, meta } = $props()
</script>

<div class="flex flex-wrap items-start gap-x-5 gap-y-3">
  <div>
    {@render children()}
  </div>
  <div class="flex w-[min(280px,100%)] min-w-0 flex-col gap-2">
    {@render meta()}
  </div>
</div>