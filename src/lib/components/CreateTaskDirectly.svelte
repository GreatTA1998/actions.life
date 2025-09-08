<script>
  import Template from '$lib/db/models/Template.js'
  import MyInput from '$lib/components/MyInput.svelte'
  import { getRandomID } from '$lib/utils/core.js'
  import { user } from '$lib/store'
  import { onMount, getContext } from 'svelte'

  const { Task } = getContext('app')

  export let startDateISO
  export let startTime = ''
  export let onfocusout = () => {}

  let allTemplates = null
  let searchResults = []
  let taskName = ''

  onMount(async () => {
    const temp = await Template.getAll({ userID: $user.uid, includeStats: false })
    allTemplates = temp
  })

  function searchTaskTemplates () {
    if (allTemplates === null) return

    searchResults = allTemplates.filter(template => 
      template.name.toLowerCase().includes(taskName.toLowerCase())
    )
  }

  function oninput (e) {
    taskName = e.target.value
    searchTaskTemplates()
  }

  function onEnterPress (e) {
    if (searchResults.length === 1) {
      createTaskFrom(searchResults[0])
    } 
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
        startTime,
        persistsOnList: false
      }
    })
    onfocusout() // we reset here because this function can get called directly by clicking the search result
  }

  async function createNormalTask () {
    if (taskName !== '') {
      Task.create({
        id: getRandomID(),
        newTaskObj: {
          name: taskName,
          startDateISO,
          startTime,
          persistsOnList: false
        }
      })
    }
    onfocusout()
  }
</script>

<MyInput value={taskName}
  {oninput}
  {onEnterPress}
  {onfocusout}
/>

{#if taskName.length >= 1}
  <div class="core-shadow cast-shadow card">
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
  .card {
    background-color: white; 
    padding: 6px; 
    border-radius: 12px
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