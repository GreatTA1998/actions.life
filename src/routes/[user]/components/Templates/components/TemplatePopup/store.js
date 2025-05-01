import { getPeriodicity } from '../../recurrenceParser.js'

// flawed, should also handle changed dates that falls outside of the original schedule
// for example, if it routine repeats MWF, but the task is scheduled for Thursday, it was modified
export function isException(task, template) {
  if (!task || !template) {
    console.log("isException received null/undefined task or template", {task, template})
    return false
  }
  
  for (const k of Object.keys(task)) {
    if (['notes', 'duration', 'imageDownloadURL', 'iconURL'].includes(k)) {      
      if (task[k] !== template[k]) { 
        console.log("Exception found =", task.id, k, task[k], template[k])
        return true
      }
    }
  }
  return false
}

export function getPreviewSpan ({ rrStr }) {
  switch (getPeriodicity(rrStr)) {
    case 'yearly': return 365 * 2
    case 'monthly': return 31 * 2
    default: return 7 * 2
  }
}