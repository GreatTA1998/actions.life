<script>
  import AddTemplate from './components/AddTemplate.svelte'
  import SimpleDropzone from '$lib/Reusable/SimpleDropzone.svelte'
  import EditTemplatePopup from './components/EditTemplatePopup/EditTemplatePopup.svelte'
  import { updateTemplate } from './store.js'
  import { getDisplayLength } from './utils.js'
  import Templates from '/src/db/models/Templates/index.js'
  export let templates
  export let crontab
  let draggedTemplate
  const templateWidthInPx = 180
  const dayOfWeekSymbol = ['S', 'M', 'T', 'W', 'T', 'F', 'S']


  function handleDrop(newOrderValue) {
    updateTemplate({
      templateID: draggedTemplate.id,
      keyValueChanges: { orderValue: newOrderValue },
      oldTemplate: templates.find(template => template.id === draggedTemplate.id)
    })
  }
</script>

<div>
  <AddTemplate {crontab} defaultOrderValue={templates.length} />

  {#each templates as template, i (template.id)}
    {#if i === 0}
      <SimpleDropzone
        on:new-order-value={(e) => handleDrop(e.detail)}
        aboveOrder={0}
        belowOrder={templates[0].orderValue}
      />
      <!-- general case drop-zone: must be between 2 templates-->
    {:else if i > 0 && i < templates.length}
      <SimpleDropzone
        on:new-order-value={(e) => handleDrop(e.detail)}
        aboveOrder={templates[i - 1].orderValue}
        belowOrder={templates[i].orderValue}
      />
    {/if}

    <EditTemplatePopup let:setIsPopupOpen {template}>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        on:click={() => setIsPopupOpen({ newVal: true })}
        style="display: flex; align-items: center; cursor: pointer;"
        draggable="true"
        on:dragstart|self={(e) => (draggedTemplate = template)}
      >
        {#if template.iconURL}
          <!-- svelte-ignore a11y-missing-attribute -->
          <img src={template.iconURL} style="width: 60px; height: 60px;" />
        {:else}
          <div style="width: 60px; height: 60px" />
        {/if}

        <div style="width: {templateWidthInPx}px;">
          <div style="font-size: 16px; font-color: rgb(120, 120, 120)">
            {template.name}
          </div>
          {#if Templates.getPeriodFromCrontab(template.crontab)==="weekly"}
          <div style="display: flex; margin-top: 4px;">
            {#each dayOfWeekSymbol as _, i}
              <div
                class="day-of-week-circle"
                class:highlighted={template.crontab
                  .split(' ')[4]
                  .split(',')
                  .includes((i + 1).toString())}
              ></div>
            {/each}
          </div>
          {/if}
          {#if template.totalTasksCompleted}
          <div style="margin-left: 8px;">
            <div
              style="display: flex; align-items: center; margin-top: 8px;
              margin-bottom: 0px; max-width: {templateWidthInPx}px;"
            >
              {#each { length: template.totalTasksCompleted } as _, i}
                <div
                  style="background: green; border-radius: 4px; width: {getDisplayLength(
                    { template, templateWidthInPx }
                  )}px;
                  height: 3px; margin-right: 2px;"
                />
              {/each}
            </div>
            <div
              style="font-weight: 400; font-size: 14px; margin-top: 8px; color:
              green"
            >
            {Math.round((template.totalMinutesSpent / 60) * 10) / 10} hr            </div>
          </div>
        {/if}
        </div>

        <!-- Time spent statistics -->
       
      </div>
    </EditTemplatePopup>

    {#if i === templates.length - 1}
      <SimpleDropzone
        on:new-order-value={(e) => handleDrop(e.detail)}
        aboveOrder={templates[i].orderValue}
        belowOrder={templates[i].orderValue + 1}
      />
    {/if}
  {/each}
</div>

<style src="./Column.css">
  .day-of-week-circle {
    border-radius: 2px;
    background-color: rgb(223, 223, 223);
    width: 4px;
    height: 4px;
    margin: 4px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: 1px solid rgb(111, 111, 111);
  }

  .highlighted {
    background-color: orange;
    border: none;
  }
</style>
