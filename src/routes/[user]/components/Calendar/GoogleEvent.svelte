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

<div class="google-event" style="height: {height}px;" title={event.summary}>
  {event.summary}
</div>

<style>
  .google-event {
    pointer-events: none;
    background-color: #4285F4; /* Google Blue */
    border: 1px solid #3367D6;
    opacity: 0.8;
    color: white;
    font-size: 12px;
    padding: 2px 4px;
    overflow: hidden;
    border-radius: 4px;
    z-index: 1; /* Below tasks potentially */
  }
</style>