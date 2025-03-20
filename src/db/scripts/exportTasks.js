import Tasks from './Tasks.js';
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const mariusUserID = "6uIcMMsBEkQ85OINCDADtrygzZx1"; //TESTING


export async function exportTasks(user, fileName){
    const data = await Tasks.getByDateRange(user, '2024-02-10', '2024-12-12');
    fs.writeFile(path.join(__dirname, 'data', fileName + '.txt') , JSON.stringify(data), err => {
        if (err) {
          console.error(err);
        } else {
         console.log('written succesfully to ', path.join(__dirname, 'data', fileName + '.txt'));
        }
      });
}

exportTasks(mariusUserID, 'mariusTasks');