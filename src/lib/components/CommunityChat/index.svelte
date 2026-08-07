<script>
  import Message from '$lib/db/models/Message.js'
  import RecursiveMessage from './RecursiveMessage.svelte'
  import CommunityChatComposer from './NewMessage.svelte'

  let roots = $state([])

  $effect(() => Message.listenByParent('', messages => roots = messages))
</script>

<div>
  <div class="max-h-[min(360px,80dvh)] overflow-y-auto">
    {#each roots as message (message.id)}
      <RecursiveMessage {message} />
    {/each}
  </div>
  <CommunityChatComposer parentID='' />
</div>