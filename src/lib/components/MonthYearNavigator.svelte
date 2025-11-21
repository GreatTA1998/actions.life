<script>
  import { DateTime } from 'luxon'

  let {
    month = $bindable(DateTime.now().startOf('month'))
  } = $props()

  let selectedYear = $derived(month.year)
  let monthName = $derived(month.toFormat('MMMM'))

  function prevMonth() {
    month = month.minus({ months: 1 })
  }

  function nextMonth() {
    month = month.plus({ months: 1 })
  }

  function handleYearInput(e) {
    const val = parseInt(e.target.value)
    // Allow typing (handle partials) but only update if reasonable
    if (!isNaN(val) && val >= 1 && val <= 9999) {
      month = month.set({ year: val })
    }
  }
</script>

<div class="header">
  <div class="title-group">
    <span class="month-label">{monthName}</span>
    <input 
      type="number" 
      class="year-input" 
      value={selectedYear} 
      oninput={handleYearInput}
      placeholder="YYYY"
    />
  </div>
  
  <div class="nav-group">
    <button type="button" class="nav-btn" onclick={prevMonth} aria-label="Previous month">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    <button type="button" class="nav-btn" onclick={nextMonth} aria-label="Next month">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
  </div>
</div>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: calc(var(--spacing, 12px) * 0.5) calc(var(--spacing, 12px) * 0.75);
  }

  .title-group {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }

  .nav-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .month-label {
    font-weight: 700;
    font-size: clamp(22px, 5.5vw, 28px);
    color: var(--text-primary, #000);
    line-height: 1.2;
  }
  
  .year-input {
    width: 5ch;
    font-family: inherit;
    font-size: clamp(20px, 5vw, 26px);
    font-weight: 400;
    color: var(--text-secondary, #666);
    background: transparent;
    border: none;
    border-bottom: 1px dashed var(--text-secondary, #999);
    padding: 0;
    padding-bottom: 2px;
    margin: 0;
    border-radius: 0;
    transition: all 0.2s;
    line-height: 1.2;
    -moz-appearance: textfield;
    appearance: textfield;
  }
  
  .year-input:hover {
    color: var(--text-primary, #000);
    border-bottom-color: var(--text-primary, #000);
    background: transparent;
  }
  
  .year-input:focus {
    color: var(--text-primary, #000);
    border-bottom-color: var(--primary-color, #007aff);
    border-bottom-style: solid;
    background: transparent;
    outline: none;
  }

  .year-input::-webkit-outer-spin-button,
  .year-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-secondary, #666);
    cursor: pointer;
    padding: 0;
    width: var(--touch-target, 44px);
    height: var(--touch-target, 44px);
    border-radius: 50%;
    transition: background-color 0.2s;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  
  .nav-btn:hover {
    background-color: var(--hover-bg, #f0f0f0);
    color: var(--text-primary, #000);
  }
</style>

