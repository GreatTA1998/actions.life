
<script>
  import { updateFirestoreDoc } from "/src/helpers/firestoreHelpers";
  import { user } from '/src/store'
</script>

<div style='display: flex; align-items: center; column-gap: 4px;'>
  <input type="checkbox" bind:checked={$user.hasGridlines} 
    on:change={e => updateFirestoreDoc(`users/${$user.uid}`, { hasGridlines: e.target.checked }
  )}/>
  Show gridlines for calendar
</div>
