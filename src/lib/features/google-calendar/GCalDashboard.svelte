<script>
  import { getFirestoreCollection, listenToCollection } from '$lib/db/helpers.js'
  import { user } from '$lib/store'
  import { allAccounts } from '$lib/features/google-calendar/gcal.js'
  import { round } from '$lib/utils/core.js'
  import { getContext, onMount } from 'svelte'
  import { cloudFunction } from '$lib/utils/cloudFunctions.js'
  import { db } from '$lib/db/init.js'
  import { collection } from 'firebase/firestore'

  const { GCalAccount } = getContext('app')

  onMount(async () => {
    const gcalAccounts = await getFirestoreCollection(`/users/${$user.uid}/googleAccounts`)
    allAccounts.set(gcalAccounts)
    await Promise.all(gcalAccounts.map(account => {
      cloudFunction('fetchGoogleCalendars',{ refreshToken: account.refreshToken.value })
        .then(result => 
          GCalAccount.update(account.id, {
            allCals: result.data.calendars
          })
        )
    }))

    return listenToCollection(
      collection(db, `/users/${$user.uid}/googleAccounts`),
      (newVals) => allAccounts.set(newVals)
    )
  })

  function toggle (e, calID, account) {
    e.stopPropagation()
    const oldA = account.selectedCalIDs
    const newA = oldA.includes(calID) ? oldA.filter(id => id !== calID) : [...oldA, calID]

    GCalAccount.update(account.id, {  
      selectedCalIDs: newA
    })
  }

  function updateOpacity (e, account) {
    GCalAccount.update(account.id, {
      opacity: round(e.target.value, 1)
    })
  }
</script>

{#if $allAccounts.length > 0}
  <div class="flex gap-8 user-select-none flex-wrap">
    {#each $allAccounts as account (account.id)}
      <div class="flex flex-col gap-1"> 
        <h2 class="text-sm font-bold">{account.email}</h2>

        <input value={account.opacity} 
          type="range" min="0.1" max="0.9" step="any" onchange={e => updateOpacity(e, account)}
          style="--thumb-color: rgba(200, 200, 200, {account.opacity})"
          class="my-2 appearance-none h-[6px] rounded"
          style:background="linear-gradient(to right, rgba(180, 180, 180, 0.1), rgba(180, 180, 180, 0.9))"
        />
        
        <div style:opacity={account.opacity}>
          {#each account.allCals as cal (cal.id)}
            {@const visible = account.selectedCalIDs}

            <label 
              class="flex items-center gap-2 cursor-pointer py-1"
              onclick={e => toggle(e, cal.id, account)}
            >
              <div 
                class="shrink-0 size-[18px] rounded flex items-center justify-center" 
                class:checked={visible.includes(cal.id)}
                style:background-color={cal.backgroundColor}
              >
                {#if visible.includes(cal.id)}
                  <span class="text-white text-sm font-bold">✓</span>
                {/if}
              </div>
              <span class="text-sm">
                {cal.summary || cal.id}
              </span>
            </label>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>

  /* Thumb styling for WebKit (Chrome, Safari) */
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #666;
    background: white;
    background: var(--thumb-color);
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
</style>