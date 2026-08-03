<script>
  import { DateTime } from 'luxon'
  import MonthYearMenus from './MonthYearMenus.svelte'

  let {
    valueDT = null,
    onChange = () => {},
    onVisibilityChange = () => {},
    onclose = () => {}
  } = $props()

  let visibleMonthDT = $derived(valueDT ?? DateTime.now())

  let days = $derived.by(() => {
    const grid = []
    let current = visibleMonthDT.startOf('month')
    while (current <= visibleMonthDT.endOf('month')) {
      grid.push(current)
      current = current.plus({ days: 1 })
    }
    return grid
  })

  function selectDate (dayDT) {
    if (dayDT.toISODate() === valueDT?.toISODate()) {
      onChange('') 
    } else {
      onChange(dayDT.toISODate())
    }
    onclose()
  }
</script>

<div class="w-[clamp(280px,100vw,380px)] p-2 user-select-none grid gap-y-2">
  <MonthYearMenus dt={visibleMonthDT} onChange={newVal => {
    const { year, month } = newVal
    let dt = visibleMonthDT.set({ year })
    dt = dt.set({ month })
    visibleMonthDT = dt
    onVisibilityChange({ year, month })
  }} />

  <div class="grid grid-cols-7 gap-1">
    {#each ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as day}
      <div class="text-center text-neutral-700 text-[12px] font-medium">{day}</div>
    {/each}
  </div>

  <div class="grid grid-cols-7 gap-1">
    {#each days as dayDT, i}
      <button onclick={() => selectDate(dayDT)}
        style:grid-column-start={i === 0 ? dayDT.weekday : ''}
        class={[
          'text-[16px] h-[32px] justify-center rounded-lg',
          dayDT.hasSame(DateTime.now(), 'day') && 'font-bold',
          dayDT.toISODate() === valueDT?.toISODate() && 'bg-[var(--primary-color)] text-white font-semibold'
        ]}
      >
        {dayDT.day}
      </button>
    {/each}
  </div>
</div>