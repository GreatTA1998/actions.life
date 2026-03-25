<script>
  import MslSend from 'virtual:icons/material-symbols-light/send'

  let {
    value = $bindable(''),
    onSend = () => {},
    placeholder = '',
    as = 'div'
  } = $props()
</script>

<svelte:element
  this={as}
  class="shrink-0 border-t border-neutral-200/90 bg-white p-2.5"
>
  <div
    class="flex items-center px-1 gap-2 rounded-lg border border-neutral-200 bg-neutral-50/50 border-neutral-300 bg-white ring-1 ring-neutral-200/80"
  >
    <textarea
      bind:value
      {placeholder}
      rows="1"
      class="max-h-28 min-h-[2.5rem] w-0 min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm leading-5 text-neutral-800 outline-none placeholder:text-neutral-400"
    ></textarea>

    <button onclick={onSend}
      class="justify-center rounded-md size-6 bg-neutral-900 text-white disabled:opacity-40"
      disabled={!value.trim()}
    >
      <MslSend style="font-size: 1rem" />
    </button>
  </div>
</svelte:element>
