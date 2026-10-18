<script>
  import { getContext } from 'svelte'
  import { user } from '$lib/store'

  let { parentObj, task = null, collection = 'tasks' } = $props()

  const { openTaskPopup } = getContext('task-popup')

  $effect(() => {
    if (parentObj?.name != null) return
    const uid = $user?.uid
    const taskId = task?.id ?? null
    const parentID = task?.parentID ?? parentObj?.id ?? null
    console.error('ParentBadge: parent doc missing', {
      taskId,
      taskName: task?.name ?? null,
      parentID,
      startDateISO: task?.startDateISO ?? null,
      taskPath: uid && taskId ? `users/${uid}/${collection}/${taskId}` : null,
      parentPath: uid && parentID ? `users/${uid}/${collection}/${parentID}` : null,
      task,
      parentObj
    })
  })
</script>

<div 
  onclick={e => { 
    e.stopPropagation()
    openTaskPopup(parentObj)
  }} 
  class={[
    'font-medium shrink-0',
    'max-w-[12ch] whitespace-nowrap overflow-hidden'
  ]} 
  style="
    color: var(--color); 
    font-size: var(--font-size, 0.75rem);
    padding: var(--padding, 0px 4px);
    border: 1px solid rgba(150, 150, 150, 0.2);
    border-radius: var(--border-radius, 12px);
    background: var(--background, rgba(120, 120, 120, 0.15))
  "
>
  {parentObj?.name?.split(' ')[0]}
</div>
