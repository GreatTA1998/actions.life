import { updateTemplate } from './store.js'
import Template from '/src/lib/db/models/Template'

export const filterByType = (tasks, type) =>
  tasks.filter((task) => Template.getPeriodFromCrontab(task.crontab) === type)
    .sort((a, b) => a.orderValue - b.orderValue)


export const getDisplayLength = ({ template, templateWidthInPx }) => {
  const hours = template.totalMinutesSpent / 60
  const maxTimeBarWidth = window.innerWidth / 3 - templateWidthInPx
  const pixelsPerHour = maxTimeBarWidth / hours
  const accurateLength =
    (hours / template.totalTasksCompleted) * pixelsPerHour
  return accurateLength
}

export const updateCrontab = ({ selectedDays, template, crontabIndex }) => {
  console.log('crontabIndex', crontabIndex)
  let updatedCrontab = template.crontab.split(" ");
  if (crontabIndex == 'yearly') {
    updatedCrontab = selectedDays;
  } else {
    const selectedDaysFiltered = selectedDays.filter(day => day !== '0');
    updatedCrontab[crontabIndex] = selectedDaysFiltered.length ? selectedDaysFiltered.sort().join(',') : '0';
    updatedCrontab = updatedCrontab.join(' ');
  }
  updateTemplate({
    templateID: template.id, keyValueChanges: { crontab: updatedCrontab },
    oldTemplate: template
  })
}