<script>
  import { DateTime } from 'luxon'
  import { pixelsPerHour } from './store.js'

  let { event } = $props()

  let height = $derived.by(() => {
    const startDT = DateTime.fromISO(event.start.dateTime)
    const endDT = DateTime.fromISO(event.end.dateTime)
    const durationMinutes = endDT.diff(startDT, 'minutes').minutes
    return durationMinutes * ($pixelsPerHour / 60)
  })
</script>

<div 
  class="google-event" 
  style="
    height: {height}px; 
    background-color: {event.backgroundColor}; 
    color: {event.foregroundColor};
  " 
  title={event.summary}
>
  {event.summary}
</div>

<style>
  .google-event {
    opacity: 0.4;
    font-size: calc(0.8rem * var(--scale));
    padding: var(--left-padding);
    border-radius: var(--left-padding);
    overflow: hidden;
  }
</style>