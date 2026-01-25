<script>
  import { onMount, getContext } from 'svelte'
  import { page } from '$app/stores'

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
    const temp = await Template.getAll({ userID: $page.params.user, includeStats: false })
    allTemplates = temp
  })

  function searchTaskTemplates () {
    if (allTemplates === null) return

    searchResults = allTemplates.filter(template => 
      template.name.toLowerCase().includes(taskName.toLowerCase())
    )
  }
</script>

{#if taskName.length >= 1}
  <div class="core-shadow cast-shadow card">
    {#each searchResults as template (template.id)}
      <!-- class:option-highlight={searchResults.length === 1 && searchResults[0].name.toLowerCase().split(' ').includes(taskName)} -->
      <div onclick={() => onSelect(template)}
        class="autocomplete-option"
      >
        {#if template.iconURL}
          <img src={template.iconURL} style="width: 24px; height: 24px;" alt="template icon"/>
        {/if}

        <div style="margin-left: {template.iconURL ? '0px' : '12px'}">
          {template.name}
        </div>
      </div>
    {/each}
  </div>
{/if}

<style lang="scss">
  .card {
    width: 200px;
    max-height: 480px;
    overflow-y: auto;
    background-color: white; 
    padding: 6px; 
    border-radius: 12px;
  }

  .autocomplete-option {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 4px;
    padding-right: 12px;
    font-size: 12px;
    border-radius: 12px;

    display: flex;
    align-items: center;
  }

  .option-highlight {
    background-color: rgb(240, 240, 240);
  }

  .autocomplete-option:hover {
    @extend .option-highlight;
  }
</style>