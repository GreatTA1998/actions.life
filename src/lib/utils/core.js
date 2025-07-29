export function createDebouncedFunction (func, waitFor) {
  let timeout

  const debouncedFn = (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...args)
    }, waitFor)
  }

  debouncedFn.cancel = () => {
    clearTimeout(timeout)
  }

  return debouncedFn
}

export function formatDate (dateStr) {
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

// % gives the remainder, not the modulus, see https://stackoverflow.com/a/17323608/7812829
export function mod (n, m) {
  return ((n % m) + m) % m;
}

export function getRandomID () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let autoId = '';
  for (let i = 0; i < 20; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return autoId;
}

export function getDateInMMDD (dateClassObject) {
  let dd = dateClassObject.getDate() // between 1 to 31
  let mm = dateClassObject.getMonth() + 1 // 0 to 11
  if (dd < 10) dd = '0' + dd 
  if (mm < 10) mm = '0' + mm
  return `${mm}/${dd}`
}

export function getHHMM (dateClassObj) {
  const d = dateClassObj
  const hh = ensureTwoDigits(d.getHours()) 
  const mm = ensureTwoDigits(d.getMinutes())
  return hh + ":" + mm
}

// now format to hh:mm format to be compatible with old API
export function ensureTwoDigits (number) {
  return (number < 10 ? `0${number}` : `${number}`)
}

export function twoDigits (number) {
  return (number < 10 ? `0${number}` : `${number}`)
}

export function getTimeInHHMM ({ dateClassObj }) {
  const d = dateClassObj
  const hh = ("0" + d.getHours()).slice(-2) 
  const mm = ("0" + d.getMinutes()).slice(-2)
  return hh + ":" + mm
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