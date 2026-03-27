<script>
  import Message from '$lib/db/models/Message.js'
  import RecursiveMessage from './RecursiveMessage.svelte'
  import CommunityChatComposer from './NewMessage.svelte'

  let roots = $state([])

  $effect(() => Message.listenByParent('', messages => roots = messages))
</script>

<div class="flex flex-col gap-3">
  <div class="overflow-hidden rounded-xl border border-neutral-200/90 bg-neutral-50/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
    <div class="max-h-[min(360px,80vh)] divide-y divide-neutral-200/80 overflow-y-auto">
      {#each roots as message (message.id)}
        <RecursiveMessage {message} />
      {/each}
    </div>

    <CommunityChatComposer
      parentID=''
    />
  </div>
</div>