const functions = require('firebase-functions');
const { getFirestore, getDocs, collection, where } = require('firebase-admin/firestore');
const { DateTime } = require('luxon');
const { parseExpression } = require('cron-parser');
const db = getFirestore('schema-compliant');
const { getRandomID, getPeriodFromCrontab } = require('./utils.js');

const handleTemplate = async (template) => {
    const period = getPeriodFromCrontab(template.crontab);
    if(period !== 'yearly' && period !== 'monthly' && period !== 'weekly') return;
    const offset = getPeriodFromCrontab(template.crontab) === 'yearly' ? { years: 2 } : { months: 2 };
    const startDate = DateTime.fromISO(template.lastGeneratedTask).setZone(template.timeZone)
    const endDate = DateTime.now().setZone(template.timeZone).plus(offset);
    const tasksArray = await buildFutureTasks({ template, startDateJS: new Date(startDate), endDateJS: new Date(endDate), userID: template.userID, templateID: template.id });
    if(!tasksArray.length) return;
    tasksArray.forEach(async task => {
        const taskID = getRandomID()
        await db.collection('users').doc(template.userID).collection('tasks').doc(taskID).set(task)
    })
        return `upload complete for template ${template.id} ${template.name} with ${tasksArray.length} tasks`
}

async function buildFutureTasks({ template, startDateJS, endDateJS }){
    return new Promise(async (resolve, reject) => {
      try {
        const interval = parseExpression(template.crontab, { currentDate: startDateJS, endDate: endDateJS, iterator: true, tz: template.timeZone, maxIterations: 1000 });
        const generatedTasks = [];
        while (true) {
          const cronObj = interval.next();
          const ISODate = DateTime.fromJSDate(new Date(cronObj.value.toString())).setZone(template.timeZone).toFormat('yyyy-MM-dd')
          const task = buildTaskFromTemplate(template, ISODate, template.id);
          generatedTasks.push(task);
          if (cronObj.done) {
            await db.collection('users').doc(template.userID).collection('templates').doc(template.id).update({ 
                lastGeneratedTask: ISODate 
              });
            resolve(generatedTasks);
            return;
          }
        }
      } catch (error) {
        if (error.message.includes('Out of the timespan range')) {
          resolve([]);
        } else {
          console.error('error building future tasks', error);
          resolve([]);
        }
      }
    })
  }

function buildTaskFromTemplate(template, ISODate, templateID) {
    return {
      name: template.name,
      startDateISO: ISODate,
      iconURL: template.iconURL,
      tags: template.tags,
      templateID: templateID,
      timeZone: template.timeZone,
      notes: template.notes,
      notify: template.notify,
      isDone: false,
      imageDownloadURL: "",
      imageFullPath: "",
      duration: template.duration,
      parentID: "",
      orderValue: 0,
      startTime: template.startTime,
    }
  }

  exports.handleTemplate = handleTemplate;