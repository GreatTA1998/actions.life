import { sourceDB, destinationDB } from "../firestoreConnection.js";
import {
    getDoc,
    doc,
    getDocs,
    collection,
    query,
    setDoc,
    where
} from "firebase/firestore";
import {
    getStorage,
    ref,
    getDownloadURL,
} from "firebase/storage";
import { DateTime } from "luxon";

// yGVJSutBrnS1156uopQQOBuwpMl2 elton
// convertPeriodicTasksforUser("46OCRjQornhVCBmt0uz7ITASqOP2");
handleTasks("46OCRjQornhVCBmt0uz7ITASqOP2");

async function buildIconUrlMap() {
    try {
        const storage = getStorage();
        const q = query(collection(sourceDB, "/doodleIcons"));
        const querySnapshot = await getDocs(q);
        const urlArray = await Promise.all(
            querySnapshot.docs.map((doc) =>
                getDownloadURL(
                    ref(storage, `gs://project-y-2a061.appspot.com/icons/${doc.id}.png`)
                )
            )
        );
        const iconMap = {};
        querySnapshot.docs.map((doc, i) => {
            iconMap[doc.data().dataURL] = urlArray[i];
        });
        return iconMap;
    } catch (err) {
        console.error("error in buildIconUrlMap", err);
    }
}

function convertToCrontab(taskData) {
    if (taskData.crontab || taskData.crontab === "") return taskData.crontab;
    if (taskData.repeatOnDayOfMonth) return "0 0 0 * *";
    if (taskData.repeatOnDayOfWeek) {
        const daysOfWeek = [];
        taskData.repeatOnDayOfWeek.forEach((x, index) => {
            if (index === 6 && x) daysOfWeek.push(0);
            else if (x) daysOfWeek.push(index + 1);
        });
        return `0 0 * * ${daysOfWeek.length > 0 ? daysOfWeek.join(",") : "*"}`;
    }
}

async function handleTasks(userID) {
    const periodicTasks = await getDocs(collection(sourceDB, '/users', userID, "periodicTasks"));
    periodicTasks.forEach(async (template) => {
        const tasks = await getDocs(query(collection(sourceDB, '/users', userID, "tasks"), where("reusableTemplateID", "==", template.id)));
        tasks.forEach(async (task) => {
            convertTaskAndSave({ task: { ...task.data(), id: task.id }, userID, templateID: template.id });
        })
    })
}

async function convertPeriodicTasksforUser(userID) {
    console.log("converting periodic tasks for user", userID);
    const periodicTasksRef = collection(sourceDB, '/users', userID, "periodicTasks");
    const periodicTasks = await getDocs(periodicTasksRef).catch((err) => {
        console.error("error in getDocs", err);
    });
    console.log("periodic tasks", periodicTasks.docs.length);
    const iconUrlMap = await buildIconUrlMap();
    console.log("got url map");
    const promises = [];
    periodicTasks.forEach(async (task) => {
        const taskData = task.data();
        const taskDataId = task.id;
        const lastGeneratedTask = DateTime.now().toFormat("yyyy-MM-dd");
        const timeZone = DateTime.now().zoneName;
        const name = taskData.name;
        const orderValue = taskData.orderValue;
        const tags = "";
        const crontab = convertToCrontab(taskData);
        const notes = "";
        const notify = "";
        const duration = taskData.duration || 5;
        const startTime = taskData.startTime || "";
        const iconUrl = iconUrlMap[taskData.iconDataURL] || "";

        const newTask = {
            iconURL,
            lastGeneratedTask,
            timeZone,
            name,
            orderValue,
            tags,
            crontab,
            notes,
            notify,
            duration,
            startTime
        };
        const newTaskRef = doc(collection(destinationDB, "users", userID, "periodicTasks"), taskDataId);
        promises.push(setDoc(newTaskRef, newTask));
    });
    return await Promise.all(promises);
}


function convertTaskAndSave({ task, userID, templateID }) {
    const sourceTaskRef = doc(sourceDB, "users", userID, "tasks", task.id);
    const newTaskRef = doc(destinationDB, "users", userID, "tasks", task.id);
    const oldTask = getDoc(sourceTaskRef);
    const newTask = {
        ...oldTask,
        periodicTaskId: templateID
    }
    delete newTask.reusableTemplateID;
    setDoc(newTaskRef, newTask);
}