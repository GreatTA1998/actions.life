<script>
  import MslSend from 'virtual:icons/material-symbols-light/send'
  import TextArea from '$lib/components/TextArea.svelte'

  let {
    value = $bindable(''),
    onSend = () => {},
  } = $props()
</script>

<div class="p-2">
  <div class="flex items-end py-1 px-1 rounded-lg bg-white ring-1 ring-neutral-200/80">
    <TextArea {value} oninput={e => value = e.target.value}
      class="min-h-[1rem]"
    />

    <button onclick={onSend}
      class="justify-center rounded-md px-0.5 bg-neutral-900 text-white disabled:opacity-40 cursor-default"
      disabled={!value.trim()}
    >
      <MslSend style="font-size: 1rem" />
    </button>
  </div>
</div>
