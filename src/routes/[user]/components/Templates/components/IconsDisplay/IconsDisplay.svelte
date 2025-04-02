<script>
  import { user, doodleIcons } from '/src/lib/store'
  import { updateTemplate } from '/src/routes/[user]/components/Templates/store.js'
  import BasicWhiteboard from './BasicWhiteboard.svelte'
  import Icon from '/src/lib/db/models/Icon.js'
  export let template

  function handleSelectIcon(iconURL = '') {
    updateTemplate({ templateID: template.id, keyValueChanges: { iconURL }, oldTemplate: template })
  }

  function handleDeleteIcon({ id, url }) {
    if (confirm('Are you sure you want to delete this icon?')) {
      Icon.deleteRecursively({ id, uid: $user.uid, url })
      $doodleIcons = $doodleIcons.filter((icon) => icon.id !== id)
    }
  }
</script>

<div style="margin-top: 16px; display: flex; width: 100%; flex-wrap: wrap;">
  {#if $doodleIcons}
    {#each $doodleIcons as doodleIcon}
      <div>
        <!-- svelte-ignore a11y-missing-attribute -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <img
          on:click={() => handleSelectIcon(template.iconURL === doodleIcon.url ? '' : doodleIcon.url)}
          src={doodleIcon.url}
          style="width: 48px; height: 48px; cursor: pointer;"
          class:orange-border={template.iconURL === doodleIcon.url}
        />
        {#if doodleIcon.createdBy === $user.uid}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            on:click={() => {
              handleDeleteIcon({
                id: doodleIcon.id,
                url: doodleIcon.url
              })
            }}
            style="cursor: pointer; font-size: 14px;"
          >
            Delete
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<div style="margin-top: 16px; display: flex; justify-content: center">
  <BasicWhiteboard />
</div>

<style>
  .orange-border {
    border: 1px solid var(--logo-twig-color);
    background-image: linear-gradient(
        90deg,
        rgba(200, 200, 200, 0.8) 1px,
        transparent 0
      ),
      linear-gradient(180deg, rgba(200, 200, 200, 0.8) 1px, transparent 0);
    background-size: 12px 12px; 
  }
</style>
