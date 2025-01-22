<script>
  import { naturalGreen, sunshineOrange, offWhite } from '/src/store/colorTheme.js'
  import { updateFirestoreDoc } from '/src/helpers/firestoreHelpers.js'
  import { user } from '/src/store'
</script>

<div> 
  <button on:click={() => updateFirestoreDoc(`/users/${$user.uid}`, { calendarTheme: 'offWhite' })} 
    class="color-square" style:background-color={offWhite}
  >
    Cool White
  </button>

  <button on:click={() => updateFirestoreDoc(`/users/${$user.uid}`, { calendarTheme: 'naturalGreen' })} 
    class="color-square" style:background-color={naturalGreen}
  >
    Leafy Green
  </button>

  <button on:click={() => updateFirestoreDoc(`/users/${$user.uid}`, { calendarTheme: 'sunshineOrange' })} 
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