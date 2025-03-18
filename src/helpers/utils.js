import { setFirestoreDoc, updateFirestoreDoc } from '/src/helpers/firestoreHelpers.js'

// how far, INCLUDING SCROLL, the actual position on the calendar is
// // containerDistanceFromTopOfPage should be fixed, and not be affected by scrolling
// so it's the e.clientY + initialOffset + scrollOffset 
// e.clientY := coordinates relative to VIEWPORT, so doesn't matter if root page is scrolled

export function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    // year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function pureNumericalHourForm (startTime) {
  const hh = startTime.slice(0, 2)
  const mm = startTime.slice(3, 5)
  return Number(hh) + (Number(mm) / 60)
}


export function round (value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

export function getRandomColor () {
  return "hsla(" + ~~(360 * Math.random()) + "," + // hue i.e. the "color"
                "100%,"+  // 100% saturation i.e. maximize on its vividness and purity
                "60%,1)"; // 60% lightness (how much black / white mix, otherwise too faded), 1 alpha
}

export function getTrueY (e) {
  const ScrollParent = document.getElementById('scroll-parent')
  return e.clientY + ScrollParent.scrollTop - ScrollParent.getBoundingClientRect().top - ScrollParent.style.paddingTop
}

export const MIKA_PIXELS_PER_HOUR = 80
export const MIKA_PIXELS_PER_MINUTE = MIKA_PIXELS_PER_HOUR / 60

export const PIXELS_PER_HOUR = 600
export const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60

// compute's the offset from top if the task is displayed absolutely (not used if positioned statically e.g. "in today's unscheduled tasks")
export function computeOffset ({ startTime }, pxPerHour, calendarStartTime) {
  if (!calendarStartTime) {
    return
  }

  // compute how many hours ahead of calendar's starting hour
  // TODO: this breaks when the scheduled time is "lower" than the calendar's startTime i.e. need to pad 24 on top of it
  const hh = startTime.slice(0, 2)
  const mm = startTime.slice(3, 5)

  const hoursOffset = Number(hh) + (Number(mm) / 60) - parseInt(calendarStartTime.substring(0, 2)) // 8 refers to "8 am"

  // offsetFromTop = hoursOffset * pxPerHour
  return (hoursOffset * pxPerHour) || 1 // quickfix so computeOffset doesn't return a falsy value
}

/** Dispatch event on click outside of node */
// Thank god for the person who wrote took 30 minutes of debugging and still no avail
// https://svelte.dev/repl/0ace7a508bd843b798ae599940a91783?version=3.16.7
export function clickOutside (node) {
  const handleClick = event => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      node.dispatchEvent(
        new CustomEvent('click_outside', node)
      )
    }
  }
	document.addEventListener('click', handleClick, true);
  
  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
	}
}

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


// % gives the remainder, not the modulus, see https://stackoverflow.com/a/17323608/7812829
export function mod (n, m) {
  return ((n % m) + m) % m;
}

export function getDayOfWeek (MMDDString) {
  const d = new Date()
  d.setMonth(parseInt(MMDDString.substring(0, 2)) - 1) // `-1` because setMonth() is 0-indexed whereas MMDD is 1-indexed
  d.setDate(parseInt(MMDDString.substring(3, 5))) // MMDDString.substring(3, 5)
  return new Intl.DateTimeFormat(
    'en-US', 
    { weekday: 'short' }
  ).format(d)
}

// copied from chatGPT
export function getNicelyFormattedDate (dateClassObj = new Date()) {  
  const options = { 
    month: 'long',  // Display the full month name (e.g., "April")
    day: 'numeric', // Display the day of the month (e.g., "16")
    ordinal: 'numeric' // Display the ordinal suffix (e.g., "th")
  }
  const formattedDate = dateClassObj.toLocaleDateString('en-US', options)
  const suffix = getDaySuffix(dateClassObj.getDate())
  return formattedDate + suffix
}

function getDaySuffix (day) {
  if (day >= 11 && day <= 13) {
    return 'th'
  }
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default: 
      return 'th'
  }
}

export function getDateInDDMMYYYY (dateClassObject) {
  const d = dateClassObject

  const yyyy = d.getFullYear();
  let mm = d.getMonth() + 1; // Months start at 0!
  let dd = d.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  const formattedToday = dd + '/' + mm + '/' + yyyy;
  return formattedToday
}

export function getDateInMMDD (dateClassObject) {
  let dd = dateClassObject.getDate() // between 1 to 31
  let mm = dateClassObject.getMonth() + 1 // 0 to 11
  if (dd < 10) dd = '0' + dd 
  if (mm < 10) mm = '0' + mm
  return `${mm}/${dd}`
}

// copied from https://www.w3resource.com/javascript-exercises/javascript-basic-exercise-3.php
// TODO: rename, and enable it to take arbitrary Date object and return a 
// mm:dd string
export function getDateOfToday () {
  const today = new Date()   
  return getDateInMMDD(today)
}

// https://flaviocopes.com/how-to-get-tomorrow-date-javascript/
export function getDateOfTomorrow () {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return getDateInMMDD(tomorrow)
}

export function getHH () {
  const today = new Date()
  let hh = today.getHours()
  if (hh < 10) hh = '0' + hh
  return `${hh}`
}

export function getHHMM (dateClassObj) {
  const d = dateClassObj
  const hhmm = ensureTwoDigits(d.getHours()) + ':' + ensureTwoDigits(d.getMinutes())
  return hhmm
}

// now format to hh:mm format to be compatible with old API
export function ensureTwoDigits (number) {
  return (number < 10 ? `0${number}` : `${number}`)
}

export function getRandomID () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let autoId = '';
  for (let i = 0; i < 20; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return autoId;
}

// The reliable way to create date object is new Date(yyyy, mm, dd)
// where `yyyy`, `mm` and `dd` are all integers

// return d2 - d1
// Based on https://stackoverflow.com/a/15289883/7812829
// UTC computations are time-zone safe because UTC never observes Daylight Savings Time
export function computeDayDifference (dateClassObject1, dateClassObject2) {
  const msPerDay = 1000 * 60 * 60 * 24
  const msDiff = computeMillisecsDifference(dateClassObject1, dateClassObject2)
  return msDiff / msPerDay
}

// return d2 - d1
// Based on https://stackoverflow.com/a/15289883/7812829
// by shifting both dates to UTC, the DIFFERENCE calculation is "daylight-savings safe" because UTC never observes Daylight Savings Time
export function computeMillisecsDifference (dateClassObject1, dateClassObject2) {
  const d1 = dateClassObject1
  const d2 = dateClassObject2
  
  // monthIndex ranges from 0 to 11 
  // hours ranges from 0 to 23
  // minutes ranges from 0 to 69
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours(), d1.getMinutes())
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes())
  return utc2 - utc1
}

export function convertMMDDToDateClassObject (MMDD, yyyy = 2023, hhmm = '00:00') {
  const [MM, DD] = MMDD.split('/')
  const [hh, mm] = hhmm.split(':')

  // new Date(year, monthIndex, day, hours, minutes)
  return new Date(yyyy, MM - 1, DD, Number(hh), Number(mm))
}

// notice we purposely differentiate `minutes` from `mm` (month) 
// TO-DO: use destructuring so the parameters are more readable when used by clients
export function convertDDMMYYYYToDateClassObject (ddmmyyyy, hhmm = '') {
  const [dd, mm, yyyy] = ddmmyyyy.split('/')
  if (!hhmm) {
    return new Date(yyyy, mm - 1, dd)
  } else {
    const [hh, minutes] = hhmm.split(':')
    const result = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd), parseInt(hh), parseInt(minutes))
    return result
  }
   // month is 0-indexed where as mm is 1-indexed, so subtract 1 (Stackoverflow commmunity agrees this is stupid design)
}

// NOT zero-indexed, just normal
export function getMonthNameFromNumber (monthNumber) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  return monthNames[monthNumber]
}

export function twoDigits (number) {
  return (number < 10 ? `0${number}` : `${number}`)
}

// https://stackoverflow.com/a/18229149/7812829
export function getCurrentTimeInHHMM () {
  return getTimeInHHMM({ dateClassObj: new Date() })
}

export function getTimeInHHMM ({ dateClassObj }) {
  const d = dateClassObj
  const hh = ("0" + d.getHours()).slice(-2) 
  const mm = ("0" + d.getMinutes()).slice(-2)
  return hh + ":" + mm
}

export function applyFuncToEveryTreeNode ({ tree, applyFunc }) {
  const artificialRootNode = {
    name: 'root',
    children: tree
  }
  helperFunction({ node: artificialRootNode, applyFunc })
}

export function helperFunction ({ node, applyFunc }) {
  // this is a quick-fix: terminate once we find the deadline ask
  if (applyFunc(node)) {
    return
  } 
  else {
    for (const child of node.children) {
      helperFunction({ node: child, applyFunc })
    }
  }
}

export async function generateRepeatedTasks (taskObject) {
  const allGeneratedTasksToUpload = []
  const repeatGroupID = taskObject.id // the first instance of the repeated task will represent the repeatGroupID
  const d = new Date()
  for (let i = 0; i < 7; i++) { // as it's a new feature, try 7 day foresight window to avoid taking forever to delete everything manually
    d.setDate(d.getDate() + 1)

    const weekDayNumber = mod(d.getDay() - 1, 7) // for getDay(), Sunday = 0, Monday = 1
    if (taskObject.willRepeatOnWeekDayNumber[weekDayNumber]) {
      const generatedTask = await createRepeatedTask(
        { 
          repeatGroupID,
          dateClassObj: new Date(d.getTime()),
        },
        taskObject)
      allGeneratedTasksToUpload.push(generatedTask)
    }
  }
  
  return allGeneratedTasksToUpload
}

export async function createRepeatedTask ({ dateClassObj, repeatGroupID }, taskObject) {
  const taskObjCopy = {...taskObject}

  taskObjCopy.id = getRandomID()
  taskObjCopy.isDone = false
  
  taskObjCopy.repeatGroupID = repeatGroupID // way to label separate tasks as essentially clones of an original repeating task

  const yyyy = `${dateClassObj.getFullYear()}`
  const mm = twoDigits(dateClassObj.getMonth() + 1) // month is 0-indexed
  const dd = twoDigits(dateClassObj.getDate())

  // reference https://www.explanations.app/KsPz7BOExANWvkaauNKE/Xau9NekRv7t9iNJEJrPt
  function hasDeadline (task) {
    return task.deadlineDate && task.deadlineTime
  }

  function isScheduled (task) {
    return task.startYYYY && task.startDate && task.startTime
  }

  // note: we do nothing for tasks that have neither deadlines nor a scheduled time
  if (!isScheduled(taskObjCopy) && hasDeadline(taskObjCopy)) {
    // notice we keep `deadlineTime` unchanged, but shift the `deadlineDate`
    taskObjCopy.deadlineDate = `${dd}/${mm}/${yyyy}`
  } 
  else if (isScheduled(taskObjCopy)) {
    taskObjCopy.startYYYY = yyyy
    taskObjCopy.startDate = `${mm}/${dd}` 
    // keep all other attributes whatever they were
  }
  return taskObjCopy
}

// Recommended Format: The most reliable format for cross-browser compatibility is "YYYY-MM-DD", often referred to as the ISO 8601 format (e.g., "2023-04-10").
export function convertToISO8061 ({ mmdd, yyyy = '2024' }) {
  const formattedDate = mmdd.replace('/', '-')
  const iso8061 = yyyy + '-' + formattedDate
  return iso8061
}

export function convertMMDDToReadableMonthDayForm (mmdd, yyyy = '2024') {
  const iso8061 = convertToISO8061({ mmdd, yyyy })
  const dateStr = new Date(iso8061).toDateString() //  'Fri Apr 10 2020'
  const splitArr = dateStr.split(' ' )// ['Fri', 'Apr', '10', '2020']
  return splitArr[1] + ' ' + splitArr[2] 
}


// COMMON MISTAKES YOU MADE:
// Here, you're converting the legacy `$user.allTasks` into a pointer-based data structure
// So the data that you're starting with will have NO `parentID` nor `childrenIDs`
// YOU DON'T EVEN NEED THE ARTIFICAL ROOT NODE, just run a for loop on `tree` directly
export async function createIndividualFirestoreDocForEachTaskInAllTasks (tree, userDoc) {
  const artificialRootNode = {
    name: 'root',
    children: tree
  }
  for (const child of artificialRootNode.children) {
    await helperFunc({ 
      node: child, 
      parentID: "", 
      userDoc 
    })
  }
}

// "root" shouldn't be included in this
async function helperFunc ({ node, parentID, userDoc }) {
  if (!node.children) return

  node.children = node.children.filter(child => child.id)

  const newDocObj = {
    parentID: parentID || "", // handle legacy code where tasks didn't have IDs
    childrenIDs: node.children.map(child => child.id), // assuming children is an array [], mapping an empty array is still an empty array
    ...node
  }

  if (!node.id) newDocObj.id = getRandomID()
  
  await setFirestoreDoc(`/users/${userDoc.uid}/tasks/${newDocObj.id}`, newDocObj)
 
  for (const child of node.children) {
    helperFunc({ node: child, parentID: node.id, userDoc })
  }
}

export function sortByUnscheduledThenByOrderValue (array) {
  array.sort((a, b) => {
    // first, put all scheduled / grey-out tasks to the bottom
    // !! is great for situations where you're sorting
    // simply based on whether they have the property defined.
    if (!!a.startDate !== !!b.startDate) {
      return !!a.startDate - !!b.startDate
    }
    else {
      return a.orderValue - b.orderValue
    }
  })
  return array
}

export function sortByOrderValue(array) {
  array.sort((a, b) => {
    // If both elements have "orderValue", compare them directly
    if (a.orderValue !== undefined && b.orderValue !== undefined) {
      return a.orderValue - b.orderValue;
    }

    // If only one element has "orderValue", place it first
    if (a.orderValue !== undefined) {
      return -1;
    }
    if (b.orderValue !== undefined) {
      return 1;
    }

    // If neither element has "orderValue", maintain their original order
    return 0;
  });
  return array;
} 