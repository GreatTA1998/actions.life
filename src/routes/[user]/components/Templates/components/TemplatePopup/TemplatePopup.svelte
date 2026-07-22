<script>
  import PeriodicityEditor from './PeriodicityEditor.svelte'
  import IconBrowser from '../IconsDisplay/IconBrowser.svelte'
  import MyTimePicker from '$lib/components/MyTimePicker.svelte'
  import DurationPicker from '$lib/components/DurationPicker.svelte'
  import TextArea from '$lib/components/TextArea.svelte'
  import MslDeleteOutline from 'virtual:icons/material-symbols-light/delete-outline'
  import { periodicity } from '$lib/utils/rrule.js'
  import { createDebouncedFunction } from '$lib/utils/core.js'
  import Template from '$lib/db/models/Template.js'
  import NewBasePopup from '$lib/components/NewBasePopup.svelte'
  import PopupTitle from '$lib/components/PopupTitle.svelte'
  import ColorTags from '$lib/components/ColorTags.svelte'
  import DragDropContext from '$lib/components/DragDropContext.svelte'
  import TodoList from '/src/routes/[user]/components/ListsArea/TodoList.svelte'
  import { WIDTHS } from '$lib/utils/constants.js'
  import { getContext } from 'svelte'

  const { template, templateTree } = getContext('uniquely-template')
  const { closeTaskPopup } = getContext('task-popup')

  const debouncedUpdate = createDebouncedFunction(instantUpdate, 1000)

  let iconsMenu = $state(false)

  function handleDelete (e) {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this template? This won't affect past task instances but you can choose whether to delete future instances.")) {
      Template.delete($template)
      closeTaskPopup()
    }
  }

  function instantUpdate (key, value) {
    Template.updateItselfAndFutureInstances({ id: $template.id, kvChanges: {
      [key]: value
    }})
  }
</script>

<NewBasePopup onExit={closeTaskPopup}>
  <div
    class="grid w-screen gap-y-6 px-4 pt-2 pb-4"
    style:max-width="{WIDTHS.PANEL_MAX}px"
    style:max-height="80dvh"
  >
    <div class="grid gap-[10px]" style:grid-template-columns="auto 1fr">
      {#if periodicity($template.rrStr) === 'weekly'}
        <button onclick={() => iconsMenu = !iconsMenu} class="size-12 rounded-full"
          style:box-shadow={iconsMenu ? '0 4px 8px rgba(90, 179, 39, 0.5)' : '0 4px 8px rgba(0, 0, 0, 0.3)'} 
        >
          {#if $template.iconURL}
            <img src={$template.iconURL} class="size-full rounded-full" />
          {/if}
        </button>
      {/if}
      
      <PopupTitle 
        value={$template.name}
        onInput={value => debouncedUpdate('name', value)}
        parentID={$template.parentID}
        collection="templates"
      />
    </div>
    
    {#if iconsMenu}
      <IconBrowser
        includePublic
        onChange={icon => instantUpdate('iconURL', icon ? icon.url : '')}
        gridClass="mt-4 w-full"
      />
    {/if}

    {#if !$template.parentID}
      <PeriodicityEditor routine={$template} />
    {/if}

    <div class="flex items-center gap-x-2">
      <MyTimePicker value={$template.startTime}
        onTimeSelected={hhmm => instantUpdate('startTime', hhmm)}
      />
      <DurationPicker
        value={Math.round($template.duration)}
        oninput={e => instantUpdate("duration", Number(e.target.value))}
      />   
      <ColorTags task={$template}/> 
    </div>
    
    <div class="w-full">
      <TextArea value={$template.notes}
        oninput={e => debouncedUpdate('notes', e.target.value)}
        placeholder="Notes..."
        class="min-h-[3rem]"
      />
    </div>

    <DragDropContext>
      <TodoList trees={$templateTree.children}
        listWidth="100%"
        parentID={$template.id}
        style="padding-bottom: 1rem"
      />
    </DragDropContext>

    <button onclick={e => handleDelete(e)}
      class="justify-self-end rounded-full"
    >
      <MslDeleteOutline style="font-size: 1.5rem"/>
    </button>
  </div>
</NewBasePopup>