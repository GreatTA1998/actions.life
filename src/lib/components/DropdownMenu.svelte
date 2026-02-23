<script>
  import { onMount, getContext } from 'svelte'
  import { page } from '$app/state'

  const { Template } = getContext('app')

  let { 
    taskName = '',
    onSelect = () => {}
  } = $props()

  let searchResults = $state([])
  let allTemplates = $state(null)

  $effect(() => {
    searchTaskTemplates(taskName)
  })

  onMount(async () => {
    const temp = await Template.getAll({ userID: page.params.user, includeStats: false })
    allTemplates = temp
  })

  function searchTaskTemplates () {
    if (allTemplates === null) return

    searchResults = allTemplates.filter(template => 
      template.name.toLowerCase().includes(taskName.toLowerCase())
    )
  }
</script>

{#if taskName.length >= 0}
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