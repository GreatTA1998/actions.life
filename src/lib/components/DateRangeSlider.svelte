<script>
  import { DateTime } from 'luxon'

  let { startDate = $bindable(), endDate = $bindable() } = $props()

  // Slider config: month offsets from today
  const MIN_OFFSET = -36  // months
  const MAX_OFFSET = 6   // months
  const YEAR_TICKS = getYearTicks()
  
  let startOffset = $state(-12) // 1 year ago
  let endOffset = $state(0)    // today

  $effect(() => {
    startDate = offsetToDate(startOffset)
  })
  
  $effect(() => {
    endDate = offsetToDate(endOffset)
  })

  function getYearTicks() {
    const now = DateTime.now()
    const ticks = []
    
    const minYear = now.plus({ months: MIN_OFFSET }).year
    const maxYear = now.plus({ months: MAX_OFFSET }).year
    
    for (let year = minYear; year <= maxYear; year++) {
      const yearStart = DateTime.fromObject({ year, month: 1, day: 1 })
      const monthsDiff = Math.round(yearStart.diff(now, 'months').months)
      
      // Only add if the year start is within the actual offset range
      if (monthsDiff >= MIN_OFFSET && monthsDiff <= MAX_OFFSET) {
        ticks.push({ offset: monthsDiff, label: String(year), isYear: true })
      }
    }
    
    return ticks.sort((a, b) => a.offset - b.offset)
  }
  
  function offsetToDate(offset) {
    if (offset === MIN_OFFSET) return '0000-01-01' // "all past"
    if (offset === MAX_OFFSET) return '9999-12-31' // "all future"
    return DateTime.now().plus({ months: offset }).toISODate()
  }
  
  function offsetToLabel (offset) {
    if (offset === MIN_OFFSET) return 'All past'
    if (offset === MAX_OFFSET) return 'All future'
    if (offset === 0) return 'Today'
    
    // Handle past offsets
    if (offset < 0) {
      const absOffset = Math.abs(offset)
      if (absOffset >= 24) {
        const years = Math.floor(absOffset / 12)
        return `${years}yr ago`
      }
      if (absOffset === 12) return '1yr ago'
      if (absOffset === 1) return '1mo ago'
      return `${absOffset}mo ago`
    }
    
    // Handle future offsets
    if (offset === 1) return '1mo ahead'
    if (offset === 12) return '1yr ahead'
    if (offset >= 24) {
      const years = Math.floor(offset / 12)
      return `${years}yr ahead`
    }
    return `${offset}mo ahead`
  }
  
  function offsetToPercent(offset) {
    return ((offset - MIN_OFFSET) / (MAX_OFFSET - MIN_OFFSET)) * 100
  }
</script>

<div class="date-range-slider">
  <div class="range-label">
    <span>{offsetToLabel(startOffset)}</span>
    <span class="arrow">→</span>
    <span>{offsetToLabel(endOffset)}</span>
  </div>
  
  <div class="slider-container">
    <div class="slider-track">
      <div 
        class="slider-range" 
        style="left: {offsetToPercent(startOffset)}%; width: {offsetToPercent(endOffset) - offsetToPercent(startOffset)}%"
      ></div>
    </div>
    
    <input 
      type="range" 
      class="slider start-slider"
      min={MIN_OFFSET} 
      max={MAX_OFFSET} 
      bind:value={startOffset}
      oninput={() => { if (startOffset > endOffset) endOffset = startOffset }}
    />
    <input 
      type="range" 
      class="slider end-slider"
      min={MIN_OFFSET} 
      max={MAX_OFFSET} 
      bind:value={endOffset}
      oninput={() => { if (endOffset < startOffset) startOffset = endOffset }}
    />
    
    <div class="tick-marks">
      {#each YEAR_TICKS as tick}
        {#if tick.offset !== MIN_OFFSET && tick.offset !== MAX_OFFSET}
          <div class="tick" style="left: {offsetToPercent(tick.offset)}%">
            <div class="tick-line"></div>
            <span class="tick-label">{tick.label}</span>
          </div>
        {/if}
      {/each}
    </div>
  </div>
  
</div>

<style>
  .date-range-slider {
    min-width: 320px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .range-label {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .range-label .arrow {
    color: var(--text-muted);
  }

  .slider-container {
    position: relative;
    height: 50px;
    padding: 0 8px;
  }

  .slider-track {
    position: absolute;
    top: 10px;
    left: 8px;
    right: 8px;
    height: 6px;
    background: var(--surface-3);
    border-radius: 3px;
  }

  .slider-range {
    position: absolute;
    height: 100%;
    background: linear-gradient(90deg, #a78bfa, #7c3aed);
    border-radius: 3px;
  }

  .slider {
    position: absolute;
    top: 0;
    left: 8px;
    right: 8px;
    width: calc(100% - 16px);
    height: 26px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    pointer-events: none;
    margin: 0;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: var(--surface-1);
    border: 2px solid #7c3aed;
    border-radius: 50%;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.35);
  }

  .slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: var(--surface-1);
    border: 2px solid #7c3aed;
    border-radius: 50%;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }

  .tick-marks {
    position: absolute;
    top: 22px;
    left: 8px;
    right: 8px;
    height: 28px;
  }

  .tick {
    position: absolute;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .tick-line {
    width: 1px;
    height: 6px;
    background: var(--border-strong);
  }

  .tick-label {
    font-size: 0.65rem;
    color: var(--text-muted);
    margin-top: 2px;
    white-space: nowrap;
  }
</style>

