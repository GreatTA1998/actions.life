<script>
  import Template from '$lib/db/models/Template.js'
  import FormField from '$lib/components/FormField.svelte'
  import {
    getRandomID,
  } from '$lib/utils/core.js'
  import { user } from '$lib/store'
  import { onMount } from 'svelte'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  export let startDateISO
  export let newTaskStartTime = '' // hh:mm format
  export let onreset = () => {}

  let allTemplates = null
  let searchResults = []
  let newTaskName = ''

  onMount(async () => {
    const temp = await Template.getAll({ userID: $user.uid, includeStats: false })
    allTemplates = temp
  })

  function searchTaskTemplates () {
    if (allTemplates === null) return

    searchResults = allTemplates.filter(template => 
      template.name.toLowerCase().includes(newTaskName.toLowerCase())
    )
  }

  function handleEnterKey (e) {
    if (searchResults.length === 1) createTaskFrom(searchResults[0])
    else createNormalTask(e)
  }

  function createTaskFrom (template) {
    Task.create({
      id: getRandomID(),
      newTaskObj: {
        ...template,
        templateID: template.id,
        isDone: false,
        startDateISO,
        startTime: newTaskStartTime,
        persistsOnList: false
      }
    })
    onreset() // we reset here because this function can get called directly by clicking the search result
  }

  async function createNormalTask (e) {
    const newTaskName = e.detail.taskName
    if (true || newTaskName !== '') {
      Task.create({
        id: getRandomID(),
        newTaskObj: {
          name: newTaskName || 'untitled',
          startDateISO,
          startTime: newTaskStartTime,
          persistsOnList: false
        }
      })
    }
    onreset()
  }
</script>

<!--  on:focus-out={() => {
    if (newTaskName === '') {
      dispatch('reset')
    }
  }} -->
<FormField
  fieldLabel="Task Name"
  value={newTaskName}
  placeholder="Press ENTER to finish"
  on:input={e => {
    newTaskName = e.detail.value
    searchTaskTemplates()
  }}
  on:task-entered={e => handleEnterKey(e)}
/>


{#if $user && newTaskName.length >= 1}
  <div class="core-shadow cast-shadow" style="background-color: white; padding: 6px; border-radius: 12px">
    {#each searchResults as template (template.id)}
      <div on:click={() => createTaskFrom(template)}
        class="autocomplete-option"
        class:option-highlight={searchResults.length === 1}
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