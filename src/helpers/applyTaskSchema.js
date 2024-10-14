import {updateFirestoreDoc } from '/src/helpers/crud.js'


const Schema = {
  startTime: "",
  notes: "",
  reusableTemplateID: "",
  lastRanRepeatISO: "",
  parentID: "",
  name: "",
  orderValue: "",
  duration: 30,
  isDone: false,
  imageDownloadURL: "",
  imageFullPath: "",
  startDateISO: "",
  iconURL: "",
  timeZone: "",
  notify: "", //string so "0" means notification at 0 minutes instead of false
};

// NOTE: `id` will be removed from this process, as it's not explicitly stated in the schema
export default async function applyTaskSchema (task, userDoc) {
  const formattedTask = {}
  for (const [key, value] of Object.entries(Schema)) {
    formattedTask[key] = task[key] || value
  }
  if (!formattedTask.orderValue) {
    formattedTask.orderValue = await handleOrderValue(userDoc)
  }
  return formattedTask
}

async function handleOrderValue(userDoc) {
  const newVal = (userDoc.maxOrderValue || 0) + 3;
  const epsilon = Math.random() * 0.5;
  const newOrderValue = newVal + epsilon;
  await updateFirestoreDoc(`/users/${userDoc.uid}`, {
    maxOrderValue: newVal,
  }).catch((err) => console.error("error in handleOrderValue", err));
  return newOrderValue;
}
