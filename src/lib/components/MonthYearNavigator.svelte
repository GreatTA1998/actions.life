<script>
  import { DateTime } from 'luxon'
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'

  let {
    dt = DateTime.now(),
    onChange = () => {}
  } = $props()

  let selectedYear = $derived(dt.year)
  let monthName = $derived(dt.toFormat('MMMM'))

  function handleYearInput (e) {
    const val = parseInt(e.target.value)
    if (!isNaN(val) && val >= 1000 && val <= 9999) {
      onChange({ newVal: dt.set({ year: val })})
    }
  }
</script>

<div class="flex items-center justify-between py-1 px-2">
  <div class="flex gap-3 items-baseline">
    <PopoverMenu>
      {#snippet activator ({ id, anchorName })}
        <button popovertarget={id} style:anchor-name={anchorName}>
          <span class="month-label pb-[2px]" style:border-bottom="1px solid #999">
            {monthName} 
          </span>
        </button>
      {/snippet}
      
      {#snippet content ({ close })}
        <div class="grid flex-col gap-y-2 py-1 px-1">
          {#each Array.from({ length: 12 }, (_, i) => i + 1) as m}
            <button style:font-weight={dt.month === m ? '600' : '400'} 
              onclick={() => { 
                onChange({ newVal: dt.set({ month: m }) })
                close()
              }}
              class="py-1 px-1 rounded"
            >
              {DateTime.fromObject({ month: m }).toFormat('LLLL')}
            </button>
          {/each}
        </div>
      {/snippet}
    </PopoverMenu>

    <input 
      type="number" 
      inputmode="numeric"
      class="year-input" 
      value={selectedYear} 
      oninput={handleYearInput}
      placeholder="YYYY"
    />
  </div>
</div>

<style>
  .month-label {
    font-weight: 700;
    font-size: clamp(22px, 5.5vw, 28px);
    line-height: 1.2;
  }
  
  .year-input {
    padding-bottom: 2px;
    line-height: 1.2;
   
    width: 5ch;
    font-size: clamp(20px, 5vw, 26px);
    color: #666;
    border-bottom: 1px dashed #999;
  }

  .year-input::-webkit-outer-spin-button,
  .year-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>

