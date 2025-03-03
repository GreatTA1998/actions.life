<script>
  import { naturalGreen, sunshineOrange, offWhite, THEMES, setCalendarTheme } from '/src/store/colorTheme.js'
  import { updateFirestoreDoc } from '/src/helpers/firestoreHelpers.js'
  import { user } from '/src/store'
  
  function changeTheme(theme) {
    updateFirestoreDoc(`/users/${$user.uid}`, { calendarTheme: theme })
  }
</script>

<div> 
  <button on:click={() => changeTheme(THEMES.OFF_WHITE)} 
    class="color-square" style:background-color={offWhite}
  >
    Cool White
  </button>

  <button on:click={() => changeTheme(THEMES.NATURAL_GREEN)} 
    class="color-square" style:background-color={naturalGreen}
  >
    Leafy Green
  </button>

  <button on:click={() => changeTheme(THEMES.SUNSHINE_ORANGE)} 
    class="color-square" style:background-color={sunshineOrange}
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