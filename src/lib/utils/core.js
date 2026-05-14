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

export function createThrottledFunction (func, waitFor) {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= waitFor) {
      last = now
      func(...args)
    }
  }
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
  const h = Math.random();
  const s = 1;    // 100% saturation
  const l = 0.6;  // 60% lightness

  // HSL to RGB conversion
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };

  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

// % gives the remainder, not the modulus, see https://stackoverflow.com/a/17323608/7812829
export function mod (n, m) {
  return ((n % m) + m) % m
}

export function randomID () {
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
  const hh = twoDigits(d.getHours()) 
  const mm = twoDigits(d.getMinutes())
  return hh + ':' + mm
}

// now format to hh:mm format to be compatible with old API

export function twoDigits (number) {
  return (number < 10 ? `0${number}` : `${number}`)
}

// TO-DO: make it reactive in the future
export function isMobile () {
  return window.innerWidth <= 768 // You can adjust the width threshold as needed
}

export function minutes (HHmm) {
  const [hours, minutes] = HHmm.split(':').map(Number)
  return hours * 60 + minutes
}

export function formatHours (minutes, decimalPlaces = 1) {
  const H = round(minutes / 60, decimalPlaces)
  return `${H} hr${H !== 1 ? 's' : ''}`
}

export function getLocalY (container, clientY) {
  const rect = container.getBoundingClientRect()
  return clientY + container.scrollTop - rect.top
  // IN CASE WE NEED IT IN THE FUTURE
  // const { paddingTop } = getComputedStyle(container)
  //   - parseFloat(paddingTop)
}

export function getLocalX (container, clientX) {
  const rect = container.getBoundingClientRect()
  return clientX + container.scrollLeft - rect.left
}