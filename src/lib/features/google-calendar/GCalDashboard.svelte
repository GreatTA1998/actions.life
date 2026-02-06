<script>
  import { allAccounts, cals } from '$lib/store'
  import { round } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  const { GCalAccount } = getContext('app')

  function toggle (e, calID, account) {
    e.stopPropagation()
    const oldA = account.selectedCalIDs ?? cals[account.id].map(cal => cal.id)
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

<div class="flex gap-8 user-select-none flex-wrap">
  {#each $allAccounts as account}
    <div class="flex flex-col gap-1">
      <h2 style:font-size="0.875rem" class="font-bold">{account.email}</h2>

      <input type="range" min="0.1" max="0.9" step="0.1" onchange={e => updateOpacity(e, account)}
        style="--thumb-color: rgba(200, 200, 200, {account.opacity})"
        class="opacity-slider" 
      />
      
      <div style:opacity={account.opacity}>
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
    </div>
  {/each}
</div>

<style>
  .opacity-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    background: linear-gradient(to right, rgba(180, 180, 180, 0.1), rgba(180, 180, 180, 0.9));
    border-radius: 4px;
    outline: none;
    cursor: pointer;
    margin: 8px 0;
  }

  /* Thumb styling for WebKit (Chrome, Safari) */
  .opacity-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #666;
    background: white;
    background: var(--thumb-color);
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    cursor: pointer;
  }

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