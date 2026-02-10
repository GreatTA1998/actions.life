<script>
  import { DateTime } from 'luxon'
  import { pixelsPerHour } from '../../../routes/[user]/components/Calendar/store.js'
  import { notesFS, titleFS } from '$lib/styles/reused.module.css'

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
  style:color={event.foregroundColor}
  style:padding="var(--left-padding)"
  style:border-radius="var(--left-padding)"
  style:overflow="hidden"
  style:font-size={titleFS}
>
  {event.summary}
  <p style:font-weight="300" style:font-size={notesFS}>
    {event.description}
  </p>
</div>