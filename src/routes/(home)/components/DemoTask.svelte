<script>
  let { name, strong = true } = $props()
</script>

<div
  class={[
    'flex w-full min-w-0 items-center gap-1.5 text-[var(--task-name-color)]',
    strong ? 'text-[0.875rem] font-semibold' : 'text-[0.8125rem] font-normal'
  ]}
>
  <span class="size-[1em] shrink-0 rounded-full border border-solid border-[var(--fine-control-color)]"></span>
  <span class="min-w-0 truncate leading-normal">{name}</span>
</div>
