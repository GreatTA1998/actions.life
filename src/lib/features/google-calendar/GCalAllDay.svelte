<script>
  import { titleFS } from '$lib/styles/reused.module.css'

  let { event } = $props()
</script>

<div class="py-1 px-2"
  style="
    background-color: {event.backgroundColor};
    color: {event.foregroundColor};
    opacity: {event.opacity};
    font-size: {titleFS};
    border-radius: 6px;
  "
>
  <span class="truncate">
    {event.summary}
  </span>
</div>