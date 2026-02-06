<script>
  let { event } = $props()
</script>

<div
  class="gcal-all-day-event"
  style="
    background-color: {event.backgroundColor};
    color: {event.foregroundColor};
    opacity: {event.opacity};
    font-size: 0.875rem;
    border-radius: 6px;
    padding: 4px 8px;
  "
>
    <span class="truncate">
      {event.summary}
    </span>
</div>