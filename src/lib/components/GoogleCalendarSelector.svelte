<script>
  import { getContext, onMount } from 'svelte'
  import { fetchGoogleCalendars } from '$lib/utils/cloudFunctions'

  const { user, User } = getContext('app')

  let calendars = $derived($user.googleCalendars || [])
  // Default to all calendars enabled if preference doesn't exist
  let enabledIds = $derived($user.selectedGoogleCalendarIds ?? calendars.map(c => c.id))

  onMount(async () => {
    await fetchGoogleCalendars()
  })

  function toggleCalendar(calendarId) {
    const currentEnabled = $user.selectedGoogleCalendarIds ?? calendars.map(c => c.id)
    const newEnabled = currentEnabled.includes(calendarId)
      ? currentEnabled.filter(id => id !== calendarId)
      : [...currentEnabled, calendarId]
    
    User.update({ selectedGoogleCalendarIds: newEnabled })
  }

  function isEnabled(calendarId) {
    return enabledIds.includes(calendarId)
  }
</script>

<div class="calendar-list">
  {#each calendars as calendar (calendar.id)}
    <label class="calendar-item" onclick={(e) => { e.stopPropagation(); toggleCalendar(calendar.id) }}>
      <div 
        class="checkbox-square" 
        class:checked={isEnabled(calendar.id)}
        style="background-color: {calendar.backgroundColor || '#4285F4'};"
      >
        {#if isEnabled(calendar.id)}
          <span class="checkmark">✓</span>
        {/if}
      </div>
      <span class="calendar-name">{calendar.summary || calendar.id}</span>
    </label>
  {/each}
</div>

<style>
  .calendar-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    user-select: none;
  }

  .calendar-item {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 4px 0;
  }

  .checkbox-square {
    width: 18px;
    height: 18px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: opacity 0.2s;
  }

  .checkbox-square.checked {
    opacity: 1;
  }

  .checkbox-square:not(.checked) {
    opacity: 0.3;
  }

  .checkmark {
    color: white;
    font-size: 0.875rem;
    font-weight: bold;
    line-height: 1;
  }

  .calendar-name {
    font-size: 0.875rem;
    flex: 1;
  }
</style>