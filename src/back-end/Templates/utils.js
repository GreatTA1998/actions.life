import cronParser from 'cron-parser';
import { DateTime } from 'luxon';
import { db } from "../firestoreConnection.js";
import { updateDoc, doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { getRandomID } from '../../helpers/everythingElse.js';
import Joi from 'joi';
import { TaskSchema } from '../Schemas';
const { parseExpression } = cronParser;

const getPeriodFromCrontab = (crontab) => {
  if (crontab === '') return 'quick';
  const parts = crontab.split(' ');
  if (parts.length !== 5) throw new Error('Invalid crontab format', crontab, parts);
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  if (dayOfMonth !== '*' && month !== '*' && dayOfWeek === '*') return 'yearly';
  if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') return 'monthly';
  if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') return 'weekly';
  console.error('Invalid crontab format', crontab);
  return 'unknown';
}


const buildFutureTasks = async ({ template, startDateJS, endDateJS, userID, templateID }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const interval = parseExpression(template.crontab, ({ currentDate: startDateJS, endDate: endDateJS, iterator: true }));
      const generatedTasks = [];
      while (true) {
        const cronObj = interval.next();
        const ISODate = DateTime.fromJSDate(new Date(cronObj.value.toString())).toFormat('yyyy-MM-dd')
        const task = buildTaskFromTemplate(template, ISODate, templateID);
        Joi.attempt(task, TaskSchema);
        generatedTasks.push(task);
        if (cronObj.done) {
          await updateDoc(doc(db, "users", userID, 'templates', templateID), { lastGeneratedTask: ISODate });
          resolve(generatedTasks);
          return;
        }
      }
    } catch (error) {
      console.error('error building future tasks', error)
      reject(error);
    }
  })
}

const deleteFutureTasks = async ({ userID, id }) => {
  const fromDate = DateTime.now().toFormat('yyyy-MM-dd');
  const tasksQuery = query(
    collection(db, "users", userID, "tasks"),
    where('templateID', '==', id),
    where('startDateISO', '>=', fromDate)
  );
  const tasksSnapshot = await getDocs(tasksQuery);
  const deletePromises = tasksSnapshot.docs.map(taskDoc => {
    const task = taskDoc.data();
    const taskDateTime = DateTime.fromISO(
      `${task.startDateISO}T${task.startTime || '23:59'}:00`,
    );
    if (taskDateTime >= DateTime.now()) {
      return deleteDoc(doc(db, "users", userID, 'tasks', taskDoc.id));
    }
    return Promise.resolve();
  });
  return Promise.all(deletePromises);
}

const postFutureTasks = async ({ userID, id, newTemplate }) => {
  try {
    const offset = getPeriodFromCrontab(newTemplate.crontab) === 'yearly' ? { years: 2 } : { months: 2 };
    const startFromYesterday = !newTemplate.startTime || newTemplate.startTime > DateTime.now().toFormat('HH:mm');
    const startDate = startFromYesterday ? DateTime.now().minus({ days: 1 }) : DateTime.now();
    const endDate = DateTime.now().plus(offset);
    const tasksArray = await buildFutureTasks({ template: newTemplate, startDateJS: new Date(startDate), endDateJS: new Date(endDate), userID, templateID: id });
    console.log('tasksArray', tasksArray)
    const hydratedTasks = [];
    tasksArray.forEach(async task => {
      const taskID = getRandomID()
      setDoc(doc(db, "users", userID, 'tasks', taskID), task)
      const hydratedTask = { ...task, id: taskID }
      hydratedTasks.push(hydratedTask)
    });
      return hydratedTasks;
  } catch (error) {
    console.error('error posting future tasks', error)
    return [];
  }

}

const getTotalStats = async ({ userID, id }) => {
  const q = query(collection(db, "users", userID, "tasks"), where('templateID', '==', id), where('startDateISO', '<=', DateTime.now().toFormat('yyyy-MM-dd')), where('isDone', '==', true));
  const snapshot = await getDocs(q)
  const totalMinutesSpent = snapshot.docs.reduce((acc, doc) => acc + doc.data().duration, 0);
  const totalTasksCompleted = snapshot.docs.length
  return [totalTasksCompleted, totalMinutesSpent]
};


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

export {
  getPeriodFromCrontab,
  buildFutureTasks,
  postFutureTasks,
  deleteFutureTasks,
  getTotalStats,
  buildTaskFromTemplate
}