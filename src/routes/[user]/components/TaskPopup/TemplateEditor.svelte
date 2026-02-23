<script>
  import PeriodicityEditor from '/src/routes/[user]/components/Templates/components/TemplatePopup/PeriodicityEditor.svelte'
  import IconsDisplay from '/src/routes/[user]/components/Templates/components/IconsDisplay/IconsDisplay.svelte'
  import MyTimePicker from '$lib/components/MyTimePicker.svelte'
  import DurationPicker from '$lib/components/DurationPicker.svelte'
  import TextArea from '$lib/components/TextArea.svelte'
  import MslDeleteOutline from 'virtual:icons/material-symbols-light/delete-outline'
  import { periodicity } from '$lib/utils/rrule.js'
  import { createDebouncedFunction } from '$lib/utils/core.js'
  import { getContext, onMount } from 'svelte'
  import { doc, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { template as templateStore } from '/src/routes/[user]/components/Templates/store.js'
  import { user } from '$lib/store'

  const { Template } = getContext('app')
  let { templateID } = $props()

  let template = $state(null)
  let iconsMenu = $state(false)

  const debouncedUpdate = createDebouncedFunction(instantUpdate, 1000)

  // Update the global template store when our local template changes
  $effect(() => {
    if (template) {
      templateStore.set(template)
    }
  })

  onMount(() => {
    if (templateID) {
      const docRef = doc(db, `/users/${$user.uid}/templates/${templateID}`)
      return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          template = { ...snap.data(), id: snap.id }
        }
      })
    }
  })

  function instantUpdate (key, value) {
    if (!template) return
    Template.updateItselfAndFutureInstances({ id: template.id, updates: {
      [key]: value
    }})
  }

  function handleDelete () {
    if (!template) return
    if (confirm("Are you sure you want to delete this template? This won't affect past task instances but you can choose whether to delete future instances.")) {
      Template.delete(template)
    }
  }
</script>

{#if template}
  <div class="template-content">
    <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
      {#if periodicity(template.rrStr) === 'weekly'}
        <button onclick={() => iconsMenu = !iconsMenu} class="icon-container" class:active={iconsMenu}>
          {#if template.iconURL}
            <img src={template.iconURL} style="width: 100%; height: 100%; border-radius: 50%;" alt="Template icon" />
          {/if}
        </button>
      {/if}

      <input value={template.name} 
        oninput={e => debouncedUpdate('name', e.target.value)}
        type="text" placeholder="Untitled" style="width: 100%; font-size: 20px;" class="template-title-input"
      />
    </div>
    
    {#if iconsMenu}
      <IconsDisplay />
    {/if}
    
    <div style="display: flex; gap: 8px; align-items: start; margin-top: 12px;">
      <div style="flex: 1 1 400px;">
        <TextArea value={template.notes}
          oninput={e => debouncedUpdate('notes', e.target.value)}
          placeholder="Notes..."
        />
      </div>

      <div class="flex items-center justify-center gap-x-2">
        <MyTimePicker value={template.startTime}
          onTimeSelected={hhmm => instantUpdate('startTime', hhmm)}
        />
        <DurationPicker
          value={Math.round(template.duration)}
          oninput={e => instantUpdate("duration", Number(e.target.value))}
        />   
      </div>
    </div>

    <div style="margin-top: 16px;">
      <PeriodicityEditor routine={template} />
    </div>

    <button onclick={e => { e.stopPropagation(); handleDelete() }} class="delete-button flex items-center">
      <MslDeleteOutline style="font-size: 1.5rem;"/>
    </button>
  </div>
{:else}
  <div class="loading">Loading template...</div>
{/if}

<style>
  .template-content {
    position: relative;
  }

  .template-title-input {
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(0, 89, 125, 0.3);
    outline: none;
    font-size: 20px;
    font-weight: 600;
    padding-left: 0px;
    padding-bottom: 4px;
    color: rgb(0, 89, 125);
  }

  .icon-container {
    width: 40px;
    height: 40px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-radius: 50%;
  }
  
  .icon-container.active {
    box-shadow: 0 2px 8px rgba(90, 179, 39, 0.5);
  }

  .delete-button {
    position: absolute;
    bottom: -8px;
    right: 0px;
    border-radius: 50%;
    padding: 4px;
    color: rgba(0, 89, 125, 0.7);
  }

  .delete-button:hover {
    background: rgba(0, 89, 125, 0.1);
    color: rgb(0, 89, 125);
  }

  .loading {
    color: rgba(0, 89, 125, 0.7);
    padding: 20px;
    text-align: center;
  }
</style>

