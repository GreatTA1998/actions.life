<script>
  import ParentBadge from '$lib/components/ParentBadge.svelte'
  import ListenToDoc from '$lib/components/ListenToDoc.svelte'
  import { placeholderFieldLarge } from '$lib/styles/reused.module.css'
  import { user } from '$lib/store'

  let {
    value = '',
    onInput = () => {},
    parentID = '',
    collection = 'tasks'
  } = $props()

  let inputRef = $state(null)
</script>

<div onclick={() => inputRef.focus()} 
  class="flex flex-1 items-center gap-x-2 pb-0.5"
  style="cursor: text; border-bottom: 1px solid var(--faint-color);"
>
  <input bind:this={inputRef} 
    {value}
    oninput={e => onInput(e.target.value)}
    placeholder="Title"
    type="text" 
    class="truncate text-clip {placeholderFieldLarge}"
    style="field-sizing: content; font-size: 1.5rem; font-weight: 700;"
  >
  {#if parentID}
    <ListenToDoc docPath="/users/{$user.uid}/{collection}/{parentID}">
      {#snippet children (parentObj)}
        <ParentBadge {parentObj} 
          --color="var(--task-name-color)" 
          --font-size="1.2rem" 
          --padding="0px 8px"
          --border-radius="24px"
          --background="rgba(230, 230, 230, 0.15)"
        />
      {/snippet}
    </ListenToDoc>
  {/if}
</div>