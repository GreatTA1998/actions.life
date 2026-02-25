<script>
  import PeriodicityEditor from './PeriodicityEditor.svelte'
  import IconsDisplay from '../IconsDisplay/IconsDisplay.svelte'
  import MyTimePicker from '$lib/components/MyTimePicker.svelte'
  import DurationPicker from '$lib/components/DurationPicker.svelte'
  import TextArea from '$lib/components/TextArea.svelte'
  import MslDeleteOutline from 'virtual:icons/material-symbols-light/delete-outline'
  import { periodicity } from '$lib/utils/rrule.js'
  import { template, templates, closeTemplateEditor, templateTree } from '../../store.js'
  import { createDebouncedFunction } from '$lib/utils/core.js'
  import Template from '$lib/db/models/Template.js'
  import NewBasePopup from '$lib/components/NewBasePopup.svelte'
  import PopupTitle from '$lib/components/PopupTitle.svelte'
  import ColorTags from '$lib/components/ColorTags.svelte'
  import DragDropContext from '$lib/components/DragDropContext.svelte'
  import PopoverInputContext from '$lib/components/PopoverInputContext.svelte'
  import TodoList from '/src/routes/[user]/components/ListsArea/TodoList.svelte'
  import { WIDTHS } from '$lib/utils/constants.js'

  const debouncedUpdate = createDebouncedFunction(instantUpdate, 1000)

  let iconsMenu = $state(false)
  let parentObj = $derived($template.parentID ? 
    $templates.find(T => T.id === $template.parentID) : null
  )

  function handleDelete () {
    if (confirm("Are you sure you want to delete this template? This won't affect past task instances but you can choose whether to delete future instances.")) {
      Template.delete($template)
      closeTemplateEditor()
    }
  }

  function instantUpdate (key, value) {
    Template.updateItselfAndFutureInstances({ id: $template.id, updates: {
      [key]: value
    }})
  }
</script>

<NewBasePopup onExit={closeTemplateEditor}>
  <div class="relative h-full w-screen flex flex-col py-2 px-4 gap-y-6" 
    style:max-width="{WIDTHS.PANEL_MAX}px"
  >
    <div class="grid gap-[10px]" style:grid-template-columns="auto 1fr">
      {#if periodicity($template.rrStr) === 'weekly'}
        <button onclick={() => iconsMenu = !iconsMenu} class="size-12 rounded-full"
          style:box-shadow={iconsMenu ? '0 2px 8px rgba(90, 179, 39, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.1)'} 
        >
          {#if $template.iconURL}
            <img src={$template.iconURL} class="size-full rounded-full" />
          {/if}
        </button>
      {/if}
      
      <PopupTitle value={$template.name}
        {parentObj}
        onInput={value => debouncedUpdate('name', value)}
      />
    </div>
    
    {#if iconsMenu}
      <IconsDisplay />
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
      />
    </div>

    <DragDropContext>
      <PopoverInputContext>
        <TodoList trees={$templateTree.children}
          listWidth="100%"
          parentID={$template.id}
          style="padding-bottom: 1rem"
        />
      </PopoverInputContext>
    </DragDropContext>

    <button onclick={e => { e.stopPropagation(); handleDelete() }} 
      class="absolute bottom-1 right-1 rounded-full p-1"
    >
      <MslDeleteOutline style="font-size: 1.5rem"/>
    </button>
  </div>
</NewBasePopup>