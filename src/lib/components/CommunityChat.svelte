<script>
  import { user } from '$lib/store'
  import Message from '$lib/db/models/Message.js'
  import RecursiveMessage from './RecursiveMessage.svelte'
  import CommunityChatComposer from './CommunityChatComposer.svelte'
  import { randomAnonymousNickname } from '$lib/utils/communityChatDisplay.js'

  let roots = $state([])
  let newVal = $state('')

  $effect(() => Message.listenByParent('', messages => roots = messages))

  async function sendRoot () {
    await Message.create({
      content: newVal.trim(),
      uid: $user.uid,
      nickname: randomAnonymousNickname()
    })
    newVal = ''
  }
</script>

<div class="flex flex-col gap-3">
  <h2 class="text-lg font-semibold">Community Support</h2>

  <div class="overflow-hidden rounded-xl border border-neutral-200/90 bg-neutral-50/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
    <div class="max-h-[min(360px,80vh)] divide-y divide-neutral-200/80 overflow-y-auto">
      {#each roots as message (message.id)}
        <RecursiveMessage {message} lineClamp={2} />
      {/each}
    </div>

    <CommunityChatComposer
      bind:value={newVal}
      onSend={sendRoot}
    />
  </div>
</div>