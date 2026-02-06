<script>
  import { updateFirestoreDoc } from '$lib/db/helpers.js'
  import { user } from '$lib/store'
  import { allAccounts, cals } from '$lib/store'

  function toggle (e, calID, account) {
    e.stopPropagation()
    const oldA = account.selectedCalIDs ?? cals[account.id].map(cal => cal.id)
    const newA = oldA.includes(calID) ? oldA.filter(id => id !== calID) : [...oldA, calID]
    
    updateFirestoreDoc(`/users/${$user.uid}/googleAccounts/${account.id}`, {
      selectedCalIDs: newA
    })
  }
</script>

<div class="flex gap-8 user-select-none flex-wrap">
  {#each $allAccounts as account}
    <div class="flex flex-col gap-1">
      <h2 style:font-size="0.875rem" class="font-bold">{account.email}</h2>
      {#each $cals[account.id] as cal (cal.id)}
        {@const visible = account.selectedCalIDs}

        <label 
          class="flex items-center gap-2 cursor-pointer py-1"
          onclick={e => toggle(e, cal.id, account)}
        >
          <div 
            class="shrink-0 w-[18px] h-[18px] rounded flex items-center justify-center" 
            class:checked={visible.includes(cal.id)}
            style:background-color={cal.backgroundColor || '#4285F4'}
            style:transition="opacity 0.2s"
          >
            {#if visible.includes(cal.id)}
              <span class="checkmark">✓</span>
            {/if}
          </div>
          <span style="font-size: 0.875rem; flex: 1">
            {cal.summary || cal.id}
          </span>
        </label>
      {/each}
    </div>
  {/each}
</div>

<style>
  .checkbox-square.checked {
    opacity: 1;
  }

  .checkbox-square:not(.checked) {
    opacity: 0.3;
  }

  .checkmark {
    color: white;
    font-size: 0.875rem;
    font-weight: bold;
    line-height: 1;
  }
</style>