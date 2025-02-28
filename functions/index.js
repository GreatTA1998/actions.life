const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const functions = require('firebase-functions');
const { checkNotify } = require('./checkNotify');
const { handleTemplate } = require('./handleTemplate');
const { getFirestore, getDocs, collection, where, setDoc, doc } = require('firebase-admin/firestore');
const db = getFirestore('schema-compliant');

exports.notifications = onSchedule(
  {
    schedule: '* * * * *', // crontab syntax every min
    region: 'asia-northeast1', // Tokyo region
  },
  async (event) => {
    await checkNotify();
  },
);

exports.templates = onSchedule(
  {
    schedule: '0 0 * * *', // crontab syntax every day at midnight
    region: 'asia-northeast1', // Tokyo region
  },
  async (req, res) => {
    functions.logger.info('periodicTasks function excecuting');
  try {
    await handleAllTemplates();
  } catch (error) {
    functions.logger.info('Error:', error);
  }
});

async function handleAllTemplates() {
    functions.logger.info('periodicTasks function excecuting');
    const allTemplates = await getAllTemplates();
    for (const template of allTemplates) {
      await handleTemplate(template);
    }
}

async function getAllTemplates() {
  const templates = [];
  const usersSnapshot = await db
    .collection('users')   
    // .where('email', '==', 'marsalius1@gmail.com') // Test user
    .get();
  
  for (const userDoc of usersSnapshot.docs) {
    const templatesSnapshot = await db
    .collection('users')
    .doc(userDoc.id)
    .collection('templates')
    .get();

    templatesSnapshot.forEach((templateDoc) => {
      templates.push({ userID: userDoc.id, id: templateDoc.id, ...templateDoc.data() });
    });
  }
  return templates;
}

// // for manual excecution
// exports.templates = onRequest({ region: 'asia-northeast1' }, 
//   async (req, res) => {
//     functions.logger.info('periodicTasks function excecuting');
//   try {
//     await handleAllTemplates();
//   } catch (error) {
//     functions.logger.info('Error:', error);
//   }
// });