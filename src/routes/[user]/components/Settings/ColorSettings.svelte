<script>
  import { updateFirestoreDoc } from '/src/lib/db/helpers.js'
  import { user } from '/src/lib/store'
  import { themes } from '/src/lib/store/themes'
  
  function changeTheme (theme) {
    updateFirestoreDoc(`/users/${$user.uid}`, { calendarTheme: theme })
  }
</script>

<div class="color-buttons"> 
  <button on:click={() => changeTheme('offWhite')} 
    class="color-button"
    style:background-color={themes.offWhite.previewColor}
    class:active={$user.calendarTheme === 'offWhite'}
  >
    Cool White
  </button>

  <button on:click={() => changeTheme('naturalGreen')} 
    class="color-button"
    style:background-color={themes.naturalGreen.previewColor}
    class:active={$user.calendarTheme === 'naturalGreen'}
  >
    Leafy Green
  </button>

  <button on:click={() => changeTheme('sunshineOrange')} 
    class="color-button"
    style:background-color={themes.sunshineOrange.previewColor}
    class:active={$user.calendarTheme === 'sunshineOrange'}
  >
    Distant sunrise
  </button>
</div>

<style>
  .color-buttons {
    display: flex;
    gap: 10px;
  }
  
  .color-button {
    border-radius: 8px;
    padding: 8px 12px;
    width: 60px; 
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.7);
    
    opacity: 0.5;
  }
  
  .color-button.active {
    font-weight: 700;
    opacity: 1;
    box-shadow: 0 3px 6px rgba(0,0,0,0.08);
  }
</style>