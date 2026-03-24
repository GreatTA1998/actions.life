<script>
  import CommunityChatThreadPopup from './CommunityChatThreadPopup.svelte'
  import CommunityChatMessageRow from './CommunityChatMessageRow.svelte'
  import CommunityChatComposer from './CommunityChatComposer.svelte'
  import { randomAnonymousNickname } from '$lib/utils/communityChatDisplay.js'
  import { onMount } from 'svelte'
  import { db } from '$lib/db/init.js'
  import { getCountFromServer, query, collection } from 'firebase/firestore'

  const demoUid = 'proto-user'
  const demoNickname = 'You'

  let userCount = $state(0)
  
  onMount(async () => {
    console.log('running')
    userCount = await getCountFromServer(query(collection(db, '/users'))).then(snapshot => snapshot.data().count)
  })

  /** @type {{ id: string, content: string, parentID: string | null, uid: string, nickname: string, serverTimestamp: number }[]} */
  let messages = $state([
    {
      id: 'm1',
      content: 'Welcome to community chat (prototype). Threads are recursive — open any message to see replies and add your own.',
      parentID: null,
      uid: 'sys',
      nickname: randomAnonymousNickname(),
      serverTimestamp: Date.now() - 3600000
    },
    {
      id: 'm2',
      content: 'Short note.',
      parentID: null,
      uid: 'u2',
      nickname: randomAnonymousNickname(),
      serverTimestamp: Date.now() - 1800000
    },
    {
      id: 'm3',
      content: 'First reply under the welcome post.',
      parentID: 'm1',
      uid: 'u3',
      nickname: randomAnonymousNickname(),
      serverTimestamp: Date.now() - 900000
    },
    {
      id: 'm4',
      content: 'Nested answer to Jordan.',
      parentID: 'm3',
      uid: demoUid,
      nickname: demoNickname,
      serverTimestamp: Date.now() - 600000
    }
  ])

  let openThreadId = $state(/** @type {string | null} */ (null))
  let threadAnchorEl = $state(/** @type {HTMLElement | null} */ (null))
  let rootDraft = $state('')

  let roots = $derived(messages.filter(m => m.parentID == null))

  function directReplyCount (parentId) {
    return messages.filter(m => m.parentID === parentId).length
  }

  function addMessage ({ parentID, content }) {
    messages = [
      ...messages,
      {
        id: crypto.randomUUID(),
        content,
        parentID,
        uid: demoUid,
        nickname: demoNickname,
        serverTimestamp: Date.now()
      }
    ]
  }

  function sendRoot () {
    const t = rootDraft.trim()
    if (!t) return
    addMessage({ parentID: null, content: t })
    rootDraft = ''
  }

  let openParent = $derived(
    openThreadId ? messages.find(m => m.id === openThreadId) : null
  )

  function closeThread () {
    openThreadId = null
    threadAnchorEl = null
  }
</script>

<div class="settings-group flex flex-col gap-3">
  <div class="title">Community Support</div>
  <p>{userCount} active users</p>

  <div
    class="overflow-hidden rounded-xl border border-neutral-200/90 bg-neutral-50/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
  >
    <div class="max-h-[min(280px,40vh)] divide-y divide-neutral-200/80 overflow-y-auto">
      {#each roots as m (m.id)}
        <CommunityChatMessageRow
          message={m}
          lineClamp={2}
          replyCount={directReplyCount(m.id)}
          onThreadClick={(e) => {
            openThreadId = m.id
            threadAnchorEl = e.currentTarget
          }}
        />
      {/each}
    </div>

    <CommunityChatComposer
      bind:value={rootDraft}
      onSend={sendRoot}
      sendLabel="Send message"
    />
  </div>
</div>

{#if openParent && threadAnchorEl}
  <CommunityChatThreadPopup
    anchorEl={threadAnchorEl}
    parentMessage={openParent}
    {messages}
    zIndex={50}
    onClose={closeThread}
    onAddMessage={payload => addMessage(payload)}
  />
{/if}
