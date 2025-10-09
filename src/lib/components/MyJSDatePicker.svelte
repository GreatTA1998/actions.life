<script>
  import 'js-datepicker/dist/datepicker.min.css'
  import { onMount } from 'svelte'
  import { getDateInMMDD } from '$lib/utils/core.js'
  import { DateTime } from 'luxon'

  export let startDateISO
  export let willOpen = false
  export let ondateselected

  let AttachTarget
  let picker

  onMount(async () => {
    const datepicker = await import('js-datepicker') // delete node_modules/.vite if it throws an error
    picker = initPicker(datepicker)
    if (startDateISO) {
      picker.setDate(
        DateTime.fromISO(startDateISO).toJSDate(),
        true // don't know what it does
      )
    }
    if (willOpen) picker.show()
  })

  function initPicker (datepicker) {
    return datepicker.default(AttachTarget, {
      onSelect: (instance, date) => { // only triggers on user select, not on programmatic select
        if (date) {
          const newMMDD = getDateInMMDD(date)
          ondateselected({ mmdd: newMMDD, yyyy: date.getFullYear() })
        }

        else { // the 2nd click on a selected date will unselect it
          ondateselected({ mmdd: '', yyyy: '' })
          picker.hide() // selecting a real date will close the datepicker, but unselecting doesn't so we do it manually here
        }
      },
      // THIS IS WHAT DISPLAYS THE "JUL 13" ETC.
      formatter: (input, date, instance) => {
        const options = { month: 'short', day: 'numeric' }
        const value = date.toLocaleDateString('en-US', options)
        input.value = value // => Jul 19
      }
    })
  }
</script>

<!-- To prevent the iOS keyboard from showing 
     inputmode='none'
     https://stackoverflow.com/a/65358992/7812829 
-->
<input bind:this={AttachTarget}
  class="my-date-field"
  inputmode="none"
  placeholder='MM/dd'
  readonly
/>

<style>
  .my-date-field {
    height: 30px;
    border-radius: 4px;
    border: 0px solid transparent;
    width: 64px;

    font-size: 14px;
    color: var(--scheduled-info-color);
  } 

  .my-date-field:focus {
    outline: none;
  }
</style>