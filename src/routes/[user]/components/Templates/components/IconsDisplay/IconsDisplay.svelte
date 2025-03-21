<script>
  import { user, doodleIcons } from '/src/store'
  import { updateTemplate } from '/src/routes/[user]/components/Templates/store.js'
  import { onMount } from 'svelte'
  import PremiumPopup from './PremiumPopup.svelte'
  import BasicWhiteboard from './BasicWhiteboard.svelte'
  import Icon from '/src/db/models/Icon.js'
  export let template
  let isShowingPremiumPopup = false

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
{#if !$user.isSubscriber}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div on:click={() => (isShowingPremiumPopup = !isShowingPremiumPopup)}
    style=""
    class="premium-intro-button"
  >
    <span class="material-symbols-outlined" style="margin-right: 4px;">
      forest
    </span>

    <div style="font-weight: 600;">Get doodle icons</div>
  </div>
  {#if isShowingPremiumPopup}
    <PremiumPopup />
  {/if}
{:else}
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
{/if}

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
