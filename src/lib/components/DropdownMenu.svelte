<script>
  import { onMount } from 'svelte'
  import { listenTo } from '$lib/db/helpers.js'
  import { db } from '$lib/db/init.js'
  import { user } from '$lib/store'
  import { query, where, collection } from 'firebase/firestore'

  let { 
    taskName = '',
    onSelect = () => {}
  } = $props()

  let allTemplates = $state([])

  let searchResults = $derived(
    allTemplates.filter(template => 
      template.name.toLowerCase().includes(taskName.toLowerCase())
    )
  )

  onMount(async () => {
    return listenTo(
      query(
        collection(db, `/users/${$user.uid}/templates`),
        where('parentID', '==', '')
      ),
      (newVals) => allTemplates = newVals
    )
  })
</script>

{#if taskName.length >= 1}
  <div class="core-shadow cast-shadow w-[200px] max-h-[480px] overflow-y-auto bg-white p-1.5 rounded-xl">
    {#each searchResults as template (template.id)}
      <div onclick={() => onSelect(template)}
        class="py-3 px-1 text-xs rounded-xl flex items-center hover:bg-[rgb(240,240,240)]"
      >
        {#if template.iconURL}
          <img src={template.iconURL} style="width: 24px; height: 24px;"/>
        {/if}

        <div class={template.iconURL ? 'ml-0' : 'ml-3'}>
          {template.name}
        </div>
      </div>
    {/each}
  </div>
{/if}