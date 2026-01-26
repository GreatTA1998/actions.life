<script>
  import { updateFirestoreDoc } from '/src/lib/db/helpers.js'
  import { user } from '/src/lib/store'
  import { themes } from '/src/lib/store/themes'
  
  function changeTheme (theme) {
    updateFirestoreDoc(`/users/${$user.uid}`, { calendarTheme: theme })
  }
</script>

<div class="color-buttons">
  {#each Object.entries(themes) as [key, theme]}
    <button on:click={() => changeTheme(key)} 
      class="color-button"
      style:background-color={theme.previewColor}
      class:active={$user.calendarTheme === key}
      title={key}
    >
    </button>
  {/each}
</div>

<style>
  .color-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .color-button {
    border-radius: 8px;
    padding: 8px 12px;
    width: 24px; 
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.7);
    
    opacity: 0.5;
    border: 1px solid rgba(0,0,0,0.1);
  }
  
  .color-button.active {
    font-weight: 700;
    opacity: 1;
    box-shadow: 0 3px 6px rgba(0,0,0,0.2);
    border: 1px solid rgba(0,0,0,0.2);
    transform: scale(1.1);
  }
</style>