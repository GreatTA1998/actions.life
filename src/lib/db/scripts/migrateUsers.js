import { sourceDB, destinationDB } from '../init.js';
import { getDocs, query, collection, doc, writeBatch, getDoc, setDoc, getCountFromServer } from 'firebase/firestore';
import User from '../models/User.js';
import Task from '../models/Task.js'
import Icon from '../models/Icon.js'
import Template from '../models/Template'


// only once
// migrateIconsCollection()


// totalMigrations('46OCRjQornhVCBmt0uz7ITASqOP2','Asia/Taipei')

// '46OCRjQornhVCBmt0uz7ITASqOP2';  // 'Asia/Taipei' Elton's Dad 
//  '6uIcMMsBEkQ85OINCDADtrygzZx1'; 'Asia/Tokyo' Maryus 
// 'FrMRSz5BwTXGjcAevXGCBVBn26J3'; 'Asia/Taipei' Elton's Mom
// 'yGVJSutBrnS1156uopQQOBuwpMl2'; 'Asia/Tokyo' Elton

async function totalMigrations(userID, timeZone) {
     await migrateUser(userID)
     await migrateTemplates(userID, timeZone)
     await migrateTasks(userID, timeZone)
     console.log(`Successfully migrated user: ${userID}`);
     return ""
}

async function migrateUser(userID) {
    const userRef = doc(sourceDB, 'users', userID);
    const userSnapshot = await getDoc(userRef);
    const newUser = {
        FCMTokens: userSnapshot.data().FCMTokens || [],
        email: userSnapshot.data().email || '',
        isSubscriber: userSnapshot.data().isSubscriber || false,
        phoneNumber: userSnapshot.data().phoneNumber || '',
        maxOrderValue: userSnapshot.data().maxOrderValue || 0,
        uid: userSnapshot.id
    }
    try {
        User.schema.parse(newUser);
    } catch (error) {
        throw new Error(`Error in user: ${userID} - ${error.message}`);
    }
    const newUserRef = doc(destinationDB, 'users', userID);
    return setDoc(newUserRef, newUser);
}

async function migrateTemplates(userID, timeZone) {
    try {
        const templatesRef = collection(sourceDB, 'users', userID, 'periodicTasks');
        const templatesSnapshot = await getDocs(query(templatesRef));
        const batch = writeBatch(destinationDB);
        templatesSnapshot.forEach((templateDoc) => {
            if (!templateDoc.data().name) return;
            const newDocRef = doc(collection(destinationDB, 'users', userID, 'templates'), templateDoc.id);
            const newTemplate = {
                name: templateDoc.data().name,
                orderValue: templateDoc.data().orderValue || 0,
                lastGeneratedTask: templateDoc.data().lastGeneratedTask || '',
                crontab: templateDoc.data().crontab || '',
                iconURL: templateDoc.data().iconURL || templateDoc.data().iconUrl || '',
                tags: templateDoc.data().tags || '',
                timeZone: templateDoc.data().timeZone || timeZone,
                notes: templateDoc.data().notes || '',
                notify: templateDoc.data().notify || '',
                duration: templateDoc.data().duration || 0,
                startTime: templateDoc.data().startTime || '',
            }
            try {
                Template.parse(newTemplate);
            } catch (error) {
                throw new Error(`Error in template: ${templateDoc.id} - ${error.message}`);
            }
            batch.set(newDocRef, newTemplate);
        });
        console.log(`Successfully migrated documents to 'templates' collection`);
        return batch.commit();
    } catch (error) {
        console.error('Error updating collection:', error);
        throw error;
    }
};

async function migrateTasks(userID, timeZone) {
    try {
        const tasks = await getDocs(query(collection(sourceDB, 'users', userID, 'tasks')))
        const batch = writeBatch(destinationDB);
        tasks.forEach((taskDoc) => {
            const newDocRef = doc(collection(destinationDB, 'users', userID, 'tasks'), taskDoc.id);
            if (!taskDoc.data().name) return;
            const newTask = {
                name: taskDoc.data().name,
                orderValue: parseInt(taskDoc.data().orderValue) || 0,
                parentID: taskDoc.data().parentID || '',
                duration: parseInt(taskDoc.data().duration) || 0,
                startDateISO: taskDoc.data().startDateISO || '',
                startTime: taskDoc.data().startTime || '',
                notify: taskDoc.data().notify || '',
                timeZone: taskDoc.data().timeZone || timeZone,
                templateID: taskDoc.data().templateID || taskDoc.data().periodicTaskId || taskDoc.data().reusableTemplateID || '',
                iconURL: taskDoc.data().iconURL || taskDoc.data().iconUrl || '',
                notes: taskDoc.data().notes || '',
                isDone: taskDoc.data().isDone || false,
                imageDownloadURL: taskDoc.data().imageDownloadURL || '',
                imageFullPath: taskDoc.data().imageFullPath || '',
                tags: taskDoc.data().tags || ''
            };
            try {
                Task.parse(newTask);
            } catch (error) {
                throw new Error(`Error in task: ${taskDoc.id} - ${error.message}`);
            }
            batch.set(newDocRef, newTask);
        });
        console.log(`Successfully updated tasks`);
        return batch.commit();
    } catch (error) {
        console.error('Error updating tasks:', error);
        throw error;
    }
}

async function migrateIconsCollection() {
    const iconsRef = collection(sourceDB, 'icons')
    const iconsSnapshot = await getDocs(iconsRef)
    const iconsDestRef = collection(destinationDB, 'icons')
    const batch = writeBatch(destinationDB)
    iconsSnapshot.forEach((iconDoc) => {
        const newIcon = {
            url: iconDoc.data().url,
            name: iconDoc.data().name,
            isShareable: iconDoc.data().isShareable,
            createdBy: iconDoc.data().createdBy,
            tags: iconDoc.data().tags || "",
        }
        try {
            Icon.parse(newIcon);
        } catch (error) {
            throw new Error(`Error in icon: ${iconDoc.id} - ${error.message}`);
        }
        const newDocRef = doc(iconsDestRef, iconDoc.id)
        batch.set(newDocRef, newIcon)
    })
    await batch.commit()
}

