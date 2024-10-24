const { onSchedule } = require('firebase-functions/v2/scheduler');
const functions = require('firebase-functions');
const { checkNotify } = require('./checkNotify');
const { handlePeriodicTask } = require('./handleTemplate');
const db = getFirestore('asian-alliance');
const { getFirestore } = require('firebase-admin/firestore');
const Joi = require('joi');
const TemplateSchema = require('./Schemas/TemplateSchema.js');

exports.notifications = onSchedule(
  {
    schedule: '* * * * *', // crontab syntax every min
    region: 'asia-northeast1', // Tokyo region
  },
  async (event) => {
    await checkNotify();
  },
);

exports.periodicTasks = onSchedule(
  {
    schedule: '0 0 * * *', // crontab syntax every day at midnight
    region: 'asia-northeast1', // Tokyo region
  },
  async (event) => {
    functions.logger.info('periodicTasks function excecuting');
    const snapshot = await db.collectionGroup('templates').get();
    const templates = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, userID: doc.ref.parent.parent.id }));
    for (const template of templates) {
      Joi.attempt(template, TemplateSchema);
      await handlePeriodicTask(template);
    }
  },
);