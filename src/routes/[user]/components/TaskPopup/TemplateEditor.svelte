<script>
  import PeriodicityEditor from '/src/routes/[user]/components/Templates/components/TemplatePopup/PeriodicityEditor.svelte'
  import IconsDisplay from '/src/routes/[user]/components/Templates/components/IconsDisplay/IconsDisplay.svelte'
  import MyTimePicker from '$lib/components/MyTimePicker.svelte'
  import MinimalisticInput from '$lib/components/MinimalisticInput.svelte'
  import UXFormTextArea from '$lib/components/UXFormTextArea.svelte'
  import { getPeriodicity } from '$lib/utils/rrule.js'
  import { createDebouncedFunction } from '$lib/utils/core.js'
  import { getContext, onMount } from 'svelte'
  import { doc, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { template as templateStore } from '/src/routes/[user]/components/Templates/store.js'

  const { Template, user } = getContext('app')
  let { templateID } = $props()

  let template = $state(null)
  let iconsMenu = $state(false)
  let unsubscribe = null

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
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          template = { ...docSnap.data(), id: docSnap.id }
        }
      })
    }

    return () => {
      if (unsubscribe) unsubscribe()
      // Don't clear template store to avoid flicker, it will be overwritten on next open
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
      {#if getPeriodicity(template.rrStr) === 'weekly'}
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
        <UXFormTextArea value={template.notes}
          oninput={e => debouncedUpdate('notes', e.target.value)}
          fieldLabel=""
          placeholder="Notes..."
        />
      </div>

      <div class="flexbox" style="column-gap: 8px; align-items: center; justify-content: center;">
        <MyTimePicker value={template.startTime}
          oninput={e => debouncedUpdate('startTime', e.target.value)}
          onTimeSelected={hhmm => instantUpdate('startTime', hhmm)}
        />
        <MinimalisticInput
          value={Math.round(template.duration)}
          oninput={e => instantUpdate("duration", Number(e.target.value))}
        />   
      </div>
    </div>

    <div style="margin-top: 16px;">
      <PeriodicityEditor routine={template} />
    </div>

    <button onclick={e => { e.stopPropagation(); handleDelete() }} class="material-symbols-outlined delete-button">
      delete
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

