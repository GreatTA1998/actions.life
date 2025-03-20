const user = "6uIcMMsBEkQ85OINCDADtrygzZx1";
import{ sourceDB, destinationDB }from "../init.js";
import {
  writeBatch,
  doc,
  getDocs,
  collection,
  query,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const nesseryProperties = [
  "startTime",
  "notes",
  "reusableTemplateID",
  "lastRanRepeatISO",
  "name",
  "orderValue",
  "parentID",
  "duration",
  "isDone",
  "imageDownloadURL",
  "imageFullPath",
];

// migrateUserDataToNewFormat("46OCRjQornhVCBmt0uz7ITASqOP2"); //Elton father or mother


// migrateUserDataToNewFormat("6uIcMMsBEkQ85OINCDADtrygzZx1"); //Marius

// runConversionForAllUsers();
async function runConversionForAllUsers() {
  try {
    const querySnapshot = await getDocs(query(collection(sourceDB, "users")));
    const userIDArray = querySnapshot.docs.map((doc) => doc.id);
    for (const id of userIDArray) {
      await migrateUserDataToNewFormat(id);
    }
  } catch (err) {
    console.error("error in runConversionForAllUsers", err);
  }
}
async function migrateUserDataToNewFormat(userID) {
  try {
    const q = query(collection(sourceDB, "users", userID, "tasks"));
    const querySnapshot = await getDocs(q);
    const tasksArray = querySnapshot.docs.map((doc) => doc.data());
    const IdArray = querySnapshot.docs.map((doc) => doc.id);
    const convertedArray = await convert(tasksArray);
    return await updateDB(userID, convertedArray, IdArray);
  } catch (err) {
    console.error(" error in migrateUserData", err);
  }
}

async function convert(dataArray) {
  try {
    const iconMap = await buildIconUrlMap();
    const convertedArray = dataArray.map((task) => {
      const newStartDateAndIcon = {
        startDateISO: task.startDate
          ? `${task.startYYYY}-${task.startDate.split("/")[0]}-${
              task.startDate.split("/")[1]
            }`
          : "",
        iconURL: iconMap[task.iconDataURL] ? iconMap[task.iconDataURL] : "",
      };

      const convertedTask = {
        ...nesseryProperties.reduce(
          (a, prop) => ({
            ...a,
            [prop]: task[prop] ? task[prop] : prop === "isDone" ? false : "",
          }),
          {}
        ),
        ...newStartDateAndIcon,
      };
      return convertedTask;
    });
    return convertedArray;
  } catch (err) {
    console.error("error in convert, ", err);
  }
}

const updateDB = async (userID, dataArray, idArray) => {
  try {
    const batch = writeBatch(destinationDB);
    idArray.map((id, i) => {
      const docRef = doc(destinationDB, "users", userID, "tasks", id);
      batch.set(docRef, dataArray[i]);
    });
    return await batch.commit();
  } catch (err) {
    console.error("error in updateDB", err);
  }
};

async function buildIconUrlMap() {
  try {
    const storage = getStorage();
    const q = query(collection(sourceDB, "doodleIcons"));
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
