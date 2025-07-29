<script>
  import TimelineRenderer from '../../[user]/components/TaskTree/TimelineRenderer.svelte'
  import TaskPopupContent from '../../[user]/components/TaskPopup/TaskPopupContent.svelte'
  import { getContext } from 'svelte'

  const { tasksCache, clickedTaskID } = getContext('app')

  const tasks = [
    {
      id: "update-1",
      name: "life-organizer.com",
      isDone: true,
      isCollapsed: false,
      startDateISO: "2022-01-16",
      startTime: "13:20",
      duration: 30,
      notes: "First prototype for a recursive task trees next to a calendar column",
      children: [],
      childrenLayout: 'normal',
      version: "0.8.2",
      type: "feature",
      imageDownloadURL: '/life-organizer.com.jpg',
      photoLayout: 'side-by-side'
    },
    {
      id: "update-2",
      name: "intentions.life",
      isDone: true,
      isCollapsed: false,
      startDateISO: "2024-01-01",
      startTime: "11:45",
      duration: 45,
      notes: "Complete overhaul of the timeline visualization with better chronological organization.",
      children: [],
      childrenLayout: 'normal',
      version: "0.8.1",
      type: "improvement",
      highlights: [
        "Cleaner timeline layouts",
        "Better task dependency visualization",
        "Improved switch between normal and timeline views"
      ]
    },
    {
      id: "update-3",
      name: "actions.life",
      isDone: true,
      isCollapsed: false,
      startDateISO: "2025-06-12",
      startTime: "16:00",
      duration: 60,
      notes: "Revolutionary photo integration that transforms task layouts based on visual content.",
      children: [],
      childrenLayout: 'normal',
      version: "0.8.0",
      type: "feature",
      highlights: [
        "Dynamic layout switching for photo tasks",
        "Side-by-side photo and notes view",
        "Enhanced visual memory context"
      ]
    }
  ]

  tasksCache.update(cache => {
    for (const task of tasks) {
      cache[task.id] = task
    }
    return cache
  })

  clickedTaskID.set(tasks[0].id)
</script>

<div style="display: flex; column-gap: 12px;">
  <div class="timeline-column">
    <div class="timeline-container">
      <TimelineRenderer
        children={tasks}
        parentID="updates-root"
        depth={0}
        ancestorRoomIDs={[]}
        isLargeFont={false}
      />
    </div>
  </div>

  <!-- a flattened popup -->
  {#if $clickedTaskID && $tasksCache[$clickedTaskID]}
    <div>
      <TaskPopupContent />
    </div>
  {/if}
</div>