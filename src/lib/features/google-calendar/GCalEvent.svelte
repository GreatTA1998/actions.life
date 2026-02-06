<script>
  import { DateTime } from 'luxon'
  import { pixelsPerHour } from '../../../routes/[user]/components/Calendar/store.js'

  let { 
    event 
  } = $props()

  let height = $derived.by(() => {
    const startDT = DateTime.fromISO(event.start.dateTime)
    const endDT = DateTime.fromISO(event.end.dateTime)
    const durationMinutes = endDT.diff(startDT, 'minutes').minutes
    return durationMinutes * ($pixelsPerHour / 60)
  })
</script>

<div 
  style:opacity={event.opacity}
  style:height="{height}px"
  style:background-color={event.backgroundColor} 
  style:color={event.foregroundColor}w
  style:padding="var(--left-padding)"
  style:border-radius="var(--left-padding)"
  style:overflow="hidden"
  style:font-size="0.875rem"
>
  {event.summary}
</div>