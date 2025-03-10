import {
  sortByOrderValue,
  convertToISO8061,
  pureNumericalHourForm
} from "/src/helpers/everythingElse.js";

// FOR HANDLING A WEEK WORTH OF NEW TASKS
// NOTE: by definition of these tasks being located on a different week, this will not
// affect the existing dates and their task trees

// totalNumber
export function buildDates({ start, totalDays }) {
  const dates = [];
  for (let i = 0; i < totalDays; i++) {
    dates.push(
      start.plus({ days: i }).toFormat('yyyy-MM-dd')
    )
  }
  return dates;
}

// recursively mutate this monolith data structure until its correct
export function reconstructTreeInMemory (firestoreTaskDocs) {
  const output = [];

  // first, do an O(n) operation, so we don't perform a O(n^2) operation constantly traversing trees
  // build a dictionary that maps a task to its children ([] if no children)
  const memo = { "": [] };
  for (const taskDoc of firestoreTaskDocs) {
    if (!memo[taskDoc.parentID]) memo[taskDoc.parentID] = [];
    memo[taskDoc.parentID].push(taskDoc);

    if (!memo[taskDoc.id]) memo[taskDoc.id] = [];
  }

  // now construct the recursive tree
  let rootTasks = memo[""];
  rootTasks = sortByOrderValue(rootTasks)
  for (const rootTask of rootTasks) {
    recursivelyHydrateChildren({
      node: rootTask,
      firestoreTaskDocs,
      memo,
      subtreeDeadlineInMsElapsed: Infinity,
    });
    output.push(rootTask);
  }
  return output;
}


export function constructCalendarTrees (firestoreTaskDocs) {
  const output = [];
  const uniqueTaskIDs = new Set()

  // first, do an O(n) operation, so we don't perform a O(n^2) operation constantly traversing trees
  // build a dictionary that maps a task to its children ([] if no children)
  const memo = { "": [] };
  for (const taskDoc of firestoreTaskDocs) {
    uniqueTaskIDs.add(taskDoc)

    if (!memo[taskDoc.parentID]) memo[taskDoc.parentID] = [];
    memo[taskDoc.parentID].push(taskDoc);

    if (!memo[taskDoc.id]) memo[taskDoc.id] = [];
  }

  // now construct the recursive tree
  for (const task of firestoreTaskDocs) {
    const isRoot = memo[""].includes(task)

    // sometimes the calendar belongs to a todo-parent, but the parent is
    // not to be found within this calendar tree,
    // so it's a detached subtree that will act as a root tree
    const isAbandonedChild = task.parentID && !uniqueTaskIDs.has(task.parentID)
    
    if (isRoot || isAbandonedChild) {
      // For root nodes, ensure rootStartDateISO matches startDateISO
      if (task.startDateISO && !task.rootStartDateISO) {
        task.rootStartDateISO = task.startDateISO;
      }
      
      recursivelyHydrateChildren({
        node: task,
        firestoreTaskDocs,
        memo,
        subtreeDeadlineInMsElapsed: Infinity,
      });
      
      // Propagate rootStartDateISO to all children
      if (task.startDateISO) {
        propagateRootStartDateISO(task, task.rootStartDateISO || task.startDateISO);
      }
      
      output.push(task)
    }
  }
  return output;
}

// Helper function to propagate rootStartDateISO to all descendants
function propagateRootStartDateISO(node, rootStartDateISO) {
  node.rootStartDateISO = rootStartDateISO;
  
  for (const child of node.children) {
    propagateRootStartDateISO(child, rootStartDateISO);
  }
}

// rename to `maxDeadlineLimitInMs`: limits how far this node's deadline can be set
function recursivelyHydrateChildren({
  node,
  firestoreTaskDocs,
  memo,
  subtreeDeadlineInMsElapsed,
}) {
  node.subtreeDeadlineInMsElapsed = subtreeDeadlineInMsElapsed;
  node.children = sortByOrderValue(memo[node.id]);
  for (const child of node.children) {
    recursivelyHydrateChildren({
      node: child,
      firestoreTaskDocs,
      memo,
      subtreeDeadlineInMsElapsed: updateSubtreeDeadlineInMsElapsed(
        node,
        subtreeDeadlineInMsElapsed
      ),
    });
  }
}

export function updateSubtreeDeadlineInMsElapsed(node, oldVal) {
  if (!node.deadlineDate || !node.deadlineTime) {
    if (oldVal !== Infinity) return oldVal;
    else return oldVal;
  } else {
    const [dd, MM, yyyy] = node.deadlineDate.split("/");
    const iso8061 = convertToISO8061({ mmdd: `${MM}/${dd}`, yyyy });
    const d = new Date(iso8061);
    const [hh, mm] = node.deadlineTime.split(":");
    d.setHours(hh, mm);

    if (d.toString() === "Invalid Date") {
      return oldVal;
    }

    const result = Math.min(d.getTime(), oldVal);
    return result;
  }
}

export function computeDateToTasksDict (taskTrees) {
  const tasksScheduledOn = {}
  for (const root of taskTrees) {
    myHelper({ node: root, rootAncestor: root, tasksScheduledOn });
  }

  // Put tasks in ascending order of `startTime`, so newer tasks are above older tasks
  // this is important because when a big task swallows a small task,
  // you need to be able to drag the small task out easily (and the small task is BELOW the big task by definition)
  for (const [key, value] of Object.entries(tasksScheduledOn)) {
    tasksScheduledOn[key].hasStartTime = tasksScheduledOn[key].hasStartTime.sort((a, b) => {
      return pureNumericalHourForm(a.startTime) - pureNumericalHourForm(b.startTime)
    })
  }
  return tasksScheduledOn
}

function myHelper ({ node, rootAncestor, tasksScheduledOn }) {
  const { startDateISO } = node
  if (startDateISO) {
    if (!tasksScheduledOn[startDateISO]) {
      tasksScheduledOn[startDateISO] = {
        noStartTime: { hasIcon: [], noIcon: [] },
        hasStartTime: []
      }
    }
    if (!node.startTime) {
      if (node.iconURL) tasksScheduledOn[startDateISO].noStartTime.hasIcon.push(node)
      else tasksScheduledOn[startDateISO].noStartTime.noIcon.push(node)
    } 
    else {
      tasksScheduledOn[startDateISO].hasStartTime.push({ rootAncestor, ...node })
    }
  }

  for (const child of node.children) {
    myHelper({ node: child, rootAncestor, tasksScheduledOn });
  }
}
