<script>
  import { updateFirestoreDoc } from '/src/db/helpers.js'
  import { user } from '/src/store'
  import { themes } from '/src/store/themes'
  
  function changeTheme (theme) {
    updateFirestoreDoc(`/users/${$user.uid}`, { calendarTheme: theme })
  }
</script>

<div> 
  <button on:click={() => changeTheme('offWhite')} 
    class="color-square" style:background-color={themes.offWhite.previewColor}
  >
    Cool White
  </button>

  <button on:click={() => changeTheme('naturalGreen')} 
    class="color-square" style:background-color={themes.naturalGreen.previewColor}
  >
    Leafy Green
  </button>

  <button on:click={() => changeTheme('sunshineOrange')} 
    class="color-square" style:background-color={themes.sunshineOrange.previewColor}
  >
    Distant sunrise
  </button>
</div>

<style>
  .color-square {
    width: 96px; 
    height: 96px; 
    border-radius: 12px;
    padding: 4px;
    box-sizing: border-box;
    font-size: 12px;
  }
</style>