<script>
  import MyInput from '$lib/components/MyInput.svelte'
  import { getRandomID } from '$lib/utils/core.js'
  import { user, isInputActive } from '$lib/store'
  import { onMount, getContext } from 'svelte'

  const { Task, Template } = getContext('app')

  let { 
    startDateISO = '', 
    startTime = '', 
    onExit = () => {},
    onCreate = () => {}
  } = $props()

  let allTemplates = $state(null)
  let searchResults = $state([])
  let taskName = $state('')

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
    if (taskName === '') onExit()
    else if (searchResults.length === 1) createTaskFrom(searchResults[0]) 
    else createNormalTask(e)
  }

  function handleClick (template) {
    createTaskFrom(template)
    onExit() // assumes the user is no longer consecutively adding tasks
  }

  async function createTaskFrom (template) {
    const result = await Task.create({
      id: getRandomID(),
      newTaskObj: {
        ...template,
        templateID: template.id, // necessary because templateID is not a property in `template`
        startDateISO,
        startTime,
        persistsOnList: false
      }
    })
    onCreate(result)
    taskName = ''
  }

  async function createNormalTask () {
    const result = await Task.create({
      id: getRandomID(),
      newTaskObj: {
        name: taskName,
        startDateISO,
        startTime,
        persistsOnList: false
      }
    })
    onCreate(result)
    taskName = ''
  }
</script>

<MyInput value={taskName}
  {oninput}
  {onEnterPress}
  onfocusout={() => {
    if (taskName.length === 0) {
      onExit()
      isInputActive.set(false)
    }
  }}
  width="var(--width-within-column)"
/>

{#if taskName.length >= 1}
  <div class="core-shadow cast-shadow card">
    {#each searchResults as template (template.id)}
      <div onclick={() => handleClick(template)}
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