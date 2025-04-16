<script>
  import { createEventDispatcher } from 'svelte'

  export let template

  const days = [, 'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] // ISO 8601 standard uses 1-7 for Mon-Sun
  const dispatch = createEventDispatcher()

  let indices = template.rrStr ? toIndices(template.rrStr) : []
  let isEditing = false

  $: onDaySelect(indices)

  function onDaySelect () {
    const rrStr = toRRStr(indices)
    isEditing = template.rrStr !== rrStr
    dispatch('rruleChange', { rrStr })
  }
  
  function toIndices (rrStr) {
    const dayParts = rrStr.match(/(?<=BYDAY=)[^;]*/) // BYDAY=TU,FR becomes TU,FR
    if (!dayParts) return []
    return dayParts[0].split(',').map(day => days.indexOf(day))
  }

  function toRRStr (indices) {
    if (!indices.length) return '' // repeating without selected days is considered an invalid recurrence rule
    else {
      return `FREQ=WEEKLY;BYDAY=${indices.map(i => days[i]).join(',')}`
    }
  }

  function toggle (k) {
    if (indices.includes(k)) indices = indices.filter(i => i !== k)
    else indices = [...indices, k].sort((i, j) => i - j)
  }
</script>

<div style="display: flex; gap: 4px;">
  {#each { length: 7 } as _, k}
    <button on:click={() => toggle(k+1)} class="circle" class:highlighted={indices.includes(k+1)}>
      {days[k+1]}
    </button>
  {/each}
</div>

<style>
  .circle {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    font-size: 12px;
    line-height: 30px;
    text-align: center;
    color: rgb(170, 170, 170);
    background-color: rgb(100, 100, 100);
    user-select: none;
  }

  .highlighted {
    background-color: orange;
    color: black;
    font-weight: 600;
  }
</style>