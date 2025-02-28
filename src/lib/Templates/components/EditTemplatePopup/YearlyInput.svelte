<script>
  import { updateTemplate } from '/src/store'
  export let template

  let yearlyDate = ''
  function validateAndSaveYearlyDate() {
    const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
    if (dateRegex.test(yearlyDate)) {
      const [month, day] = yearlyDate.split('-')
      const crontab = `0 0 ${day} ${month} *`
      updateTemplate({ templateID: template.id, keyValueChanges: { crontab: crontab }, oldTemplate: template })
    } else {
      alert('Please enter a valid date in MM-DD format')
    }
  }
</script>

<div>
  <input
    type="text"
    bind:value={yearlyDate}
    placeholder="MM-DD"
    pattern="^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$"
    title="Please enter a date in MM-DD format"
  />
  <button on:click={validateAndSaveYearlyDate}>Save</button>
</div>
