<script>
  import 'js-datepicker/dist/datepicker.min.css'
  import { onMount, createEventDispatcher } from 'svelte'
  import {
    getDateInMMDD,
    convertMMDDToDateClassObject
  } from '/src/helpers/everythingElse.js'

  // THIS COMPONENT STILL USES THE LEGACY API where `startDate` is mm/dd and `startYYYY` is yyyy

  export let MMDD
  export let YYYY
  export let placeholder

  let AttachTarget
  const dispatch = createEventDispatcher()
  let picker

  onMount(async () => {
    const datepicker = await import('js-datepicker')

    picker = datepicker.default(AttachTarget, {
      onSelect: (instance, date) => {
        if (date) {
          const newMMDD = getDateInMMDD(date)
          dispatch('date-selected', {
            selectedDate: newMMDD,
            selectedYear: date.getFullYear() // notice this is a Number
          })
        }

        // the 2nd click on the same date will cancel it
        else {
          dispatch('date-selected', {
            selectedDate: '',
            selectedYear: ''
          })
          // selecting a real date will close the datepicker,
          // but unselecting doesn't so we do it manually here
          picker.hide()
        }
      },
      formatter: (input, date, instance) => {
        const options = { month: 'short', day: 'numeric' }
        const value = date.toLocaleDateString('en-US', options)
        input.value = value // => Jul 19
      }
    })

    // initialize the picker to today's date
    if (MMDD && YYYY) {
      picker.setDate(convertMMDDToDateClassObject(MMDD, YYYY), true)
    }
  })
</script>

<!-- To prevent the iOS keyboard from showing 
     inputmode='none'
     https://stackoverflow.com/a/65358992/7812829 
-->
<input
  bind:this={AttachTarget}
  class="my-date-field"
  inputmode="none"
  readonly
  placeholder={placeholder}
/>

<style>
  .my-date-field {
    /* padding-left: 6px; */
    height: 30px;
    border-radius: 4px;
    /* border: 1px solid lightgrey; */
    border: 0px solid transparent;
    width: 64px;

    font-size: 14px;
    color: #808080;
  } 

  .my-date-field:focus {
    outline: none;
  }
</style>
